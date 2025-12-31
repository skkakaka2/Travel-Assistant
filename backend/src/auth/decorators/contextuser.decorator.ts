import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ContextUser {
  userId: number;
  username: string;
}

export const ContextUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
