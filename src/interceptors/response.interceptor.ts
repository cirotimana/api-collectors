import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../common/dto/response.dto';
import { FastifyRequest } from 'fastify';

/**
 * Interceptor para estandarizar las respuestas exitosas
 * Envuelve todas las respuestas en el formato ResponseDto
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse();
        
        const statusCode = response.statusCode;



        // Si la respuesta ya es un ResponseDto, no la envolvemos de nuevo
        if (data instanceof ResponseDto) {
          return data;
        }

        let responsePayload = data;
        let paginationMeta: any = {};

        // Detectar si data es una respuesta paginada { data: [], total: ... }
        if (data && typeof data === 'object' && Array.isArray(data.data) && 'total' in data) {
          responsePayload = data.data;
          paginationMeta = {
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: data.totalPages,
          };
        }

        const responseDto = ResponseDto.success(
          'Operación exitosa',
          responsePayload,
          request.url,
          statusCode,
        );

        // Merge pagination meta if exists
        if (Object.keys(paginationMeta).length > 0) {
          Object.assign(responseDto, paginationMeta);
        }

        return responseDto;
      }),
    );
  }
}
