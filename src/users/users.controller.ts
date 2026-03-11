import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() user: any, @Body() dto: AddressDto) {
    return this.usersService.addAddress(user.sub, dto);
  }

  @Delete('me/addresses/:addressId')
  deleteAddress(@CurrentUser() user: any, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(user.sub, addressId);
  }

  @Patch('me/addresses/:addressId/default')
  setDefaultAddress(@CurrentUser() user: any, @Param('addressId') addressId: string) {
    return this.usersService.setDefaultAddress(user.sub, addressId);
  }

  @Patch('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
