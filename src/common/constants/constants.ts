/**
 * Constantes centralizadas de la aplicacion
 */

// Codigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  BAD_REQUEST: 'Solicitud invalida',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validacion',
  DATABASE_ERROR: 'Error de base de datos',
  DUPLICATE_ENTRY: 'El registro ya existe. Por favor verifique los datos enviados (usuario o correo duplicado)',
  SELF_DELETION: 'No puedes eliminar tu propia cuenta de usuario',
} as const;

// Mensajes de exito comunes
export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESSFUL: 'Operacion exitosa',
  CREATED_SUCCESSFULLY: 'Creado exitosamente',
  UPDATED_SUCCESSFULLY: 'Actualizado exitosamente',
  DELETED_SUCCESSFULLY: 'Eliminado exitosamente',
  RETRIEVED_SUCCESSFULLY: 'Datos obtenidos exitosamente',
} as const;

// Configuracion de paginacion
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

// Configuracion de timeouts (en milisegundos)
export const TIMEOUTS = {
  DATABASE_QUERY: 30000, // 30 segundos
  API_REQUEST: 60000, // 60 segundos
} as const;

// Formatos de fecha
export const DATE_FORMATS = {
  ISO_8601: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss',
} as const;

// Configuracion de Pool de Conexiones
export const DATABASE_POOL = {
  MIN_CONNECTIONS: 5,
  MAX_CONNECTIONS: 20,
  IDLE_TIMEOUT: 30000, // 30 segundos
  CONNECTION_TIMEOUT: 2000, // 2 segundos
  ACQUIRE_TIMEOUT: 60000, // 60 segundos
} as const;

// Niveles de logging
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// Colores para logging (ANSI colors)
export const LOG_COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
} as const;
