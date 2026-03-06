import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  create(dto: CreateProductDto) {
    return new this.productModel(dto).save();
  }

  async findAll(query: ProductQuery) {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12 } = query;
    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      filter['variants.price'] = priceFilter;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.productModel.find(filter).populate('category').skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    await this.productModel.findByIdAndUpdate(id, { isActive: false });
  }
}
