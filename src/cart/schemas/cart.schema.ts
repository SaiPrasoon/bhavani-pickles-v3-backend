import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product!: Product;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true })
  weight!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user!: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];

  @Prop({ default: 0 })
  totalAmount!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
