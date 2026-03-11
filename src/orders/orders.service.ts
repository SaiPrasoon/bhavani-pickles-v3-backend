import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import {
  ProductVariant,
  ProductVariantDocument,
} from '../products/schemas/product-variant.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
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

    const order = await new this.orderModel({
      user: userId,
      items: orderItems,
      shippingAddress: dto.shippingAddress,
      totalAmount: cart.totalAmount,
      notes: dto.notes,
    }).save();

    // Clear cart after order placement
    await this.cartModel.findOneAndUpdate(
      { user: uid },
      { items: [], totalAmount: 0 },
    );

    // Decrement leftoverStock for each ordered variant, then auto-mark out of stock
    const affectedProductIds = new Set<string>();
    for (const item of cart.items) {
      const product = item.product as any;
      const productId = product._id.toString();
      await this.variantModel.updateOne(
        { product: product._id, weight: item.weight },
        { $inc: { leftoverStock: -item.quantity } },
      );
      affectedProductIds.add(productId);
    }

    // For each affected product, check if all variants are out of stock
    for (const productId of affectedProductIds) {
      const allVariants = await this.variantModel.find({ product: new Types.ObjectId(productId) });
      const allDepleted = allVariants.length > 0 && allVariants.every(v => v.leftoverStock <= 0);
      if (allDepleted) {
        await this.productModel.findByIdAndUpdate(productId, { isOutOfStock: true });
      }
    }

    return order.populate('items.product');
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
