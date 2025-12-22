/**
 * Interface para respuestas HTTP estandarizadas
 */
export interface HttpResponse<T = any> {
  /**
   * Indica si la operacion fue exitosa
   */
  success: boolean;

  /**
   * Mensaje descriptivo de la respuesta
   */
  message: string;

  /**
   * Datos de la respuesta (puede ser null en caso de error)
   */
  data: T | null;

  /**
   * Timestamp en formato ISO 8601
   */
  timestamp: string;

  /**
   * Path del endpoint que genero la respuesta
   */
  path: string;

  /**
   * Stack trace del error (solo en respuestas de error y en desarrollo)
   */
  stack?: string;

  /**
   * Codigo de estado HTTP
   */
  statusCode?: number;

  // Campos opcionales para paginacion
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
