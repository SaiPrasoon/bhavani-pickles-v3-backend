import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import {
  ProductVariant,
  ProductVariantDocument,
} from '../products/schemas/product-variant.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class OrdersService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(ProductVariant.name)
    private variantModel: Model<ProductVariantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }

  // ── Step 1: Initiate — COD confirms directly, online creates Razorpay order ──
  async initiatePayment(userId: string, dto: CreateOrderDto) {
    const uid = new Types.ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ user: uid })
      .populate('items.product')
      .lean()
      .exec();
    if (!cart || cart.items.length === 0)
      throw new BadRequestException('Cart is empty');

    const orderItems = cart.items.map((item) => {
      const product = item.product as any;
      return {
        product: product._id,
        name: product.name,
        weight: item.weight,
        quantity: item.quantity,
        price: item.price,
      };
    });

    // ── COD: create confirmed order immediately ──────────────────────────────
    if (dto.paymentType === 'COD') {
      const order = await new this.orderModel({
        user: userId,
        items: orderItems,
        shippingAddress: dto.shippingAddress,
        totalAmount: cart.totalAmount,
        notes: dto.notes,
        paymentType: 'COD',
        status: OrderStatus.CONFIRMED,
        isPaid: false,
      }).save();

      await this.clearCartAndDeductStock(uid, cart.items as any[]);
      return { orderId: order._id, paymentType: 'COD' };
    }

    // ── Online: create Razorpay order + pending DB order ────────────────────
    const razorpayOrder = await this.razorpay.orders.create({
      amount: Math.round(cart.totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await new this.orderModel({
      user: userId,
      items: orderItems,
      shippingAddress: dto.shippingAddress,
      totalAmount: cart.totalAmount,
      notes: dto.notes,
      paymentType: 'online',
      status: OrderStatus.PENDING,
      isPaid: false,
      razorpayOrderId: razorpayOrder.id,
    }).save();

    return {
      orderId: order._id,
      paymentType: 'online',
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  }

  // ── Step 2: Verify payment signature, mark order paid ───────────────────────
  async verifyPayment(orderId: string, dto: VerifyPaymentDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Verify HMAC-SHA256 signature
    const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
      )
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = OrderStatus.CONFIRMED;
    order.razorpayPaymentId = dto.razorpayPaymentId;
    await order.save();

    await this.clearCartAndDeductStock(
      order.user as Types.ObjectId,
      order.items as any[],
    );

    return order.populate('items.product');
  }

  // ── Shared: clear cart + decrement variant stock ─────────────────────────────
  private async clearCartAndDeductStock(
    userId: Types.ObjectId,
    items: Array<{ product: any; weight: string; quantity: number }>,
  ) {
    await this.cartModel.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 },
    );

    const affectedProductIds = new Set<string>();
    for (const item of items) {
      const productId = item.product._id?.toString() ?? item.product.toString();
      await this.variantModel.updateOne(
        { product: item.product._id ?? item.product, weight: item.weight },
        { $inc: { leftoverStock: -item.quantity } },
      );
      affectedProductIds.add(productId);
    }

    for (const productId of affectedProductIds) {
      const allVariants = await this.variantModel.find({
        product: new Types.ObjectId(productId),
      });
      const allDepleted =
        allVariants.length > 0 &&
        allVariants.every((v) => v.leftoverStock <= 0);
      if (allDepleted) {
        await this.productModel.findByIdAndUpdate(productId, {
          isOutOfStock: true,
        });
      }
    }
  }

  findAll() {
    return this.orderModel
      .find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  findByUser(userId: string) {
    return this.orderModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'name email')
      .populate('items.product')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
