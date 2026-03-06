import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId }).populate('items.product').exec();
    if (!cart) {
      cart = await new this.cartModel({ user: userId, items: [], totalAmount: 0 }).save();
    }
    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) cart = new this.cartModel({ user: userId, items: [], totalAmount: 0 });

    const itemPrice = product.discountPrice || product.price;
    const existingItem = cart.items.find((i) => i.product.toString() === dto.productId);

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      cart.items.push({ product: product._id as any, quantity: dto.quantity, price: itemPrice });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    return cart.populate('items.product');
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw new NotFoundException('Item not in cart');

    item.quantity = dto.quantity;
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    return cart.populate('items.product');
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    return cart.populate('items.product');
  }

  async clearCart(userId: string) {
    await this.cartModel.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0 });
  }
}
