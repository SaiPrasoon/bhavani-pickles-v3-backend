import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { AddressDto } from './dto/address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existing) throw new ConflictException('Email already in use');
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async addAddress(userId: string, dto: AddressDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(dto as any);
    return user.save();
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const idx = user.addresses.findIndex(
      (a) => (a as any)._id.toString() === addressId,
    );
    if (idx === -1) throw new NotFoundException('Address not found');
    user.addresses.splice(idx, 1);
    return user.save();
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const found = user.addresses.find(
      (a) => (a as any)._id.toString() === addressId,
    );
    if (!found) throw new NotFoundException('Address not found');

    user.addresses.forEach((a) => (a.isDefault = false));
    found.isDefault = true;
    return user.save();
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await user.save();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { isActive: false });
  }
}
