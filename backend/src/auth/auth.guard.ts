import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ContextUser } from './decorators/contextuser.decorator';

dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }
    const validateToken = this.validateToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid authorization token');
    }
    const decoded = jwt.decode(token) as { userId: string; username: string };
    const user: ContextUser = {
      userId: parseInt(decoded.userId),
      username: decoded.username,
    };
    req.user = user;
    return true;
  }

  private validateToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }
}
