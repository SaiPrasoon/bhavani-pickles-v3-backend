import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Initiate payment — creates pending order + Razorpay order
  @Post('initiate')
  initiatePayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.initiatePayment(userId, dto);
  }

  // Verify payment signature — marks order as paid
  @Post(':id/verify-payment')
  verifyPayment(@Param('id') id: string, @Body() dto: VerifyPaymentDto) {
    return this.ordersService.verifyPayment(id, dto);
  }

  @Get('my')
  getMyOrders(@CurrentUser('sub') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
