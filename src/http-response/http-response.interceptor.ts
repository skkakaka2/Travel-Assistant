import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式
 */
export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 获取响应对象
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return {
          code: statusCode,
          message: 'Success',
          data: data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
