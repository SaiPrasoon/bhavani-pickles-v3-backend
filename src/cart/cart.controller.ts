import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('sub') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:productId/:weight')
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
    @Param('weight') weight: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, productId, weight, dto);
  }

  @Delete('items/:productId/:weight')
  removeItem(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
    @Param('weight') weight: string,
  ) {
    return this.cartService.removeItem(userId, productId, weight);
  }

  @Delete()
  clearCart(@CurrentUser('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
