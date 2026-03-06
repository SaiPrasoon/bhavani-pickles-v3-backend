import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema()
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product!: Product;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  weight!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class ShippingAddress {
  @Prop({ required: true }) street!: string;
  @Prop({ required: true }) city!: string;
  @Prop({ required: true }) state!: string;
  @Prop({ required: true }) pincode!: string;
  @Prop() phone?: string;
}

const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress!: ShippingAddress;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isPaid!: boolean;

  @Prop()
  paidAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
