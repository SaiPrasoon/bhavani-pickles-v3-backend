import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: true })
export class ProductVariant {
  @Prop({ required: true })
  weight!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ min: 0 })
  discountedPrice?: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock!: number;
}

const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category!: Category;

  @Prop({ type: [ProductVariantSchema], required: true, default: [] })
  variants!: ProductVariant[];

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ min: 0, max: 5, default: 0 })
  rating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  ingredients?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
