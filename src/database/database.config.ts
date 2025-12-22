import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DATABASE_POOL } from '../common/constants/constants';

/**
 * Configuracion de TypeORM con Pool de Conexiones optimizado
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    
    // Entities
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // Sincronizacion (SIEMPRE false en produccion)
    synchronize: false,
    
    // Logging
    logging: !isProduction,
    logger: 'advanced-console',
    
    // Pool de Conexiones
    extra: {
      // Numero minimo de conexiones en el pool
      min: DATABASE_POOL.MIN_CONNECTIONS,
      
      // Numero maximo de conexiones en el pool
      max: DATABASE_POOL.MAX_CONNECTIONS,
      
      // Tiempo en ms que una conexion puede estar idle antes de ser cerrada
      idleTimeoutMillis: DATABASE_POOL.IDLE_TIMEOUT,
      
      // Tiempo en ms para esperar una conexion del pool
      connectionTimeoutMillis: DATABASE_POOL.CONNECTION_TIMEOUT,
      
      // Tiempo maximo en ms para adquirir una conexion
      acquireTimeoutMillis: DATABASE_POOL.ACQUIRE_TIMEOUT,
      
      // Configuracion SSL para produccion
      ...(isProduction && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    },
    
    // Retry logic
    retryAttempts: 3,
    retryDelay: 3000, // 3 segundos entre reintentos
    
    // Auto load entities
    autoLoadEntities: true,
    
    // Keep connection alive

  };
};
