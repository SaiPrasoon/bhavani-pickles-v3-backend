import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // If no token or invalid token, set user to null instead of throwing
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
