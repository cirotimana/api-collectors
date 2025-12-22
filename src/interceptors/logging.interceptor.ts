import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LOG_COLORS } from '../common/constants/constants';

/**
 * Interceptor para loguear el tiempo de respuesta de las APIs
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const userAgent = request.headers['user-agent'] || '';
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<FastifyReply>();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;
        
        // Determinar color basado en el status code
        let color: string = LOG_COLORS.GREEN;
        if (statusCode >= 400 && statusCode < 500) color = LOG_COLORS.YELLOW;
        if (statusCode >= 500) color = LOG_COLORS.RED;
        
        this.logger.log(
          `${method} ${url} ${color}${statusCode}${LOG_COLORS.RESET} - ${delay}ms - ${userAgent}`,
        );
      }),
    );
  }
}
