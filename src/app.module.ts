import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationsModule } from './modules/conciliations/conciliations.module';
import { LiquidationsModule } from './modules/liquidations/liquidations.module';
import { ReconciliationDiscrepanciesModule } from './modules/reconciliation-discrepancies/reconciliation-discrepancies.module';
import { CalimacoRecordsModule } from './modules/calimaco-records/calimaco-records.module';
import { CollectorRecordsModule } from './modules/collector-records/collector-records.module';
import { ConciliationReportsModule } from './modules/conciliation-reports/conciliation-reports.module';
import { CollectorsModule } from './modules/collectors/collectors.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { getDatabaseConfig } from './database/database.config';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ConciliationsModule,
    LiquidationsModule,
    ReconciliationDiscrepanciesModule,
    CalimacoRecordsModule,
    CollectorRecordsModule,
    ConciliationReportsModule,
    CollectorsModule,
    UsersModule,
    AuthModule,
    RolesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}