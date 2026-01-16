import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ContextUser } from './decorators/contextuser.decorator';

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
    
    // Kong 已经验证了 JWT token，我们只需要提取用户信息
    // 优先从 Authorization header 读取（Kong 验证后会保留）
    let token: string | null = null;
    
    // 从 Authorization header 读取
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      // 如果 Kong 已经验证通过，理论上不应该到这里
      // 但为了安全，仍然抛出错误
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      // 只解码 token，不验证（Kong 已经验证过了）
      // 如果 Kong 验证失败，请求不会到达这里
      const decoded = jwt.decode(token) as { userId: number | string; username: string } | null;
      
      if (!decoded || !decoded.userId || !decoded.username) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user: ContextUser = {
        userId: typeof decoded.userId === 'number' ? decoded.userId : parseInt(decoded.userId),
        username: decoded.username,
      };
      
      req.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Failed to extract user information from token');
    }
  }
}
