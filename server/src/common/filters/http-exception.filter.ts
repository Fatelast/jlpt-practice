import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.getMessage(exception)
        : '服务端错误';

    response.status(status).json({
      code: this.toBusinessCode(status),
      message,
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getMessage(exception: HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const message = response.message;
      return Array.isArray(message) ? message.join('; ') : String(message);
    }

    return exception.message;
  }

  private toBusinessCode(status: number) {
    if (status === HttpStatus.UNAUTHORIZED) {
      return 40100;
    }

    if (status === HttpStatus.FORBIDDEN) {
      return 40300;
    }

    if (status === HttpStatus.NOT_FOUND) {
      return 40400;
    }

    if (status === HttpStatus.CONFLICT) {
      return 40900;
    }

    if (status >= 500) {
      return 50000;
    }

    return 40000;
  }
}
