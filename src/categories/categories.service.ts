import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  create(dto: CreateCategoryDto) {
    return new this.categoryModel(dto).save();
  }

  findAll() {
    return this.categoryModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    await this.categoryModel.findByIdAndDelete(id);
  }
}
