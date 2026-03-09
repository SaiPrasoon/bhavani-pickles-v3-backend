import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductVariantDocument = HydratedDocument<ProductVariant>;

@Schema({ timestamps: true })
export class ProductVariant {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product!: Types.ObjectId;

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

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
