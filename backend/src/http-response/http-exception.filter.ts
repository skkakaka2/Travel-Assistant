import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 全局异常过滤器 - 统一错误响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 判断是否是 HttpException
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误消息
    let message = 'Internal server error';
    let errors: any = null;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        errors = responseObj.errors || responseObj.error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 统一的错误响应格式
    const errorResponse = {
      code: status,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 记录错误日志
    console.error('❌ Exception caught:', {
      status,
      message,
      path: request.url,
      exception: exception instanceof Error ? exception.message : exception,
    });
    console.error(
      '❌ Exception stack:',
      exception instanceof Error ? exception.stack : exception,
    );
    response.status(status).send(errorResponse);
  }
}
