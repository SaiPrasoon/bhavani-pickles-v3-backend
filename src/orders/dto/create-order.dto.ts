import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty() @IsString() @IsNotEmpty() street: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiProperty() @IsString() @IsNotEmpty() pincode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: ['COD', 'online'], default: 'online' })
  @IsIn(['COD', 'online'])
  paymentType: 'COD' | 'online';
}
