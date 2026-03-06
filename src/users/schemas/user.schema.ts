import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: Role.USER, enum: Role })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
