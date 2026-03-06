import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product').exec();
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const orderItems = cart.items.map((item) => {
      const product = item.product as any;
      return {
        product: product._id,
        name: product.name,
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
    await this.cartModel.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0 });

    return order.populate('items.product');
  }

  findAll() {
    return this.orderModel.find().populate('user', 'name email').populate('items.product').sort({ createdAt: -1 }).exec();
  }

  findByUser(userId: string) {
    return this.orderModel.find({ user: userId }).populate('items.product').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).populate('user', 'name email').populate('items.product').exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findByIdAndUpdate(id, { status: dto.status }, { new: true });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
