import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseDto } from '../common/dto/response.dto';
import { ERROR_MESSAGES } from '../common/constants/constants';
import { QueryFailedError } from 'typeorm';

/**
 * Filtro global de excepciones
 * Captura todas las excepciones y las formatea segun el estandar definido
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let stack: string | undefined;

    // Determinar el tipo de excepcion y extraer informacion
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        
        // Si message es un array (validacion), unir los mensajes
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      }
      
      stack = exception.stack;
    } else if (exception instanceof QueryFailedError) {
      // Error de base de datos
      status = HttpStatus.BAD_REQUEST;
      message = ERROR_MESSAGES.DATABASE_ERROR;
      stack = exception.stack;
      
      // Log adicional para errores de DB
      this.logger.error('Database Query Error:', {
        query: exception.query,
        parameters: exception.parameters,
        driverError: exception.driverError,
      });
    } else if (exception instanceof Error) {
      message = exception.message || message;
      stack = exception.stack;
    }

    // Logging detallado del error
    this.logger.error(
      `[${request.method}] ${request.url}`,
      {
        status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
        body: request.body,
        params: request.params,
        query: request.query,
        user: (request as any).user?.username || 'anonymous',
        timestamp: new Date().toISOString(),
      },
    );

    // Crear respuesta de error estandarizada
    const errorResponse = ResponseDto.error(
      message,
      request.url,
      status,
      process.env.NODE_ENV === 'development' ? stack : undefined,
    );

    // Enviar respuesta
    response.status(status).send(errorResponse);
  }
}
