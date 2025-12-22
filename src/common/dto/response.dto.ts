import { HttpResponse } from '../interfaces/http-response.interface';

/**
 * DTO generico para respuestas HTTP estandarizadas
 */
export class ResponseDto<T = any> implements HttpResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
  path: string;
  stack?: string;
  statusCode?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    path: string = '',
    statusCode?: number,
    stack?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.statusCode = statusCode;
    this.stack = stack;
  }

  /**
   * Crea una respuesta exitosa
   */
  static success<T>(
    message: string,
    data: T,
    path: string = '',
    statusCode: number = 200,
  ): ResponseDto<T> {
    return new ResponseDto(true, message, data, path, statusCode);
  }

  /**
   * Crea una respuesta de error
   */
  static error<T = null>(
    message: string,
    path: string = '',
    statusCode: number = 500,
    stack?: string,
  ): ResponseDto<T> {
    return new ResponseDto(false, message, null as any, path, statusCode, stack);
  }
}
