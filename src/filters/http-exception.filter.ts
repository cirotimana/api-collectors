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
      
      // Asignar mensaje basado en constantes segun el codigo de estado
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          message = ERROR_MESSAGES.BAD_REQUEST;
          break;
        case HttpStatus.UNAUTHORIZED:
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
          break;
      }

      // Si es un error de validacion (array), usamos la constante especifica
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        if (Array.isArray(responseObj.message)) {
          //message = ERROR_MESSAGES.VALIDATION_ERROR;
          message = `${ERROR_MESSAGES.VALIDATION_ERROR}: ${responseObj.message.join(', ')}`;
        } else if (responseObj.message && typeof responseObj.message === 'string' && !Object.values(ERROR_MESSAGES).includes(message as any)) {

             if (![400, 401, 403, 404, 500].includes(status)) {
                 message = responseObj.message;
             }
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

      // Manejo especifico para duplicados (Postgres code 23505)
      if (exception.driverError?.code === '23505') {
        const detail = exception.driverError.detail || '';
        message = ERROR_MESSAGES.DUPLICATE_ENTRY;
        
        // Opcional: agregar detalle al mensaje si es necesario, pero por el momento no 
        //if (detail) message += `: ${detail}`;
      }
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
