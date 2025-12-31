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
export class HttpResponseInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    if (request && request.body && typeof request.body === 'object') {
      Object.keys(request.body).forEach((key) => {
        if (
          request.body[key] === '' ||
          request.body[key] === undefined ||
          request.body[key] === null
        ) {
          delete request.body[key];
        }
      });
    }
    if (request && request.query && typeof request.query === 'object') {
      Object.keys(request.query).forEach((key) => {
        if (
          request.query[key] === '' ||
          request.query[key] === undefined ||
          request.query[key] === null
        ) {
          delete request.query[key];
        }
      });
    }

    return next.handle();
  }
}
