import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationsModule } from './conciliations/conciliations.module';
import { LiquidationsModule } from './liquidations/liquidations.module';
import { ReconciliationDiscrepanciesModule } from './reconciliation-discrepancies/reconciliation-discrepancies.module';
import { CalimacoRecordsModule } from './calimaco-records/calimaco-records.module';
import { CollectorRecordsModule } from './collector-records/collector-records.module';
import { ConciliationReportsModule } from './conciliation-reports/conciliation-reports.module';
import { CollectorsModule } from './collectors/collectors.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

// Entities
import { Collector } from './entities/collector.entity';
import { User } from './entities/user.entity';
import { Conciliation } from './entities/conciliation.entity';
import { ConciliationFile } from './entities/conciliation-file.entity';
import { Liquidation } from './entities/liquidation.entity';
import { LiquidationFile } from './entities/liquidation-file.entity';
import { Channel } from './entities/channel.entity';
import { ReconciliationDiscrepancy } from './entities/reconciliation-discrepancies.entity';
import { CalimacoRecord } from './entities/calimaco-record.entity';
import { CollectorRecord } from './entities/collector-record.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [Collector, User, Conciliation, ConciliationFile, Liquidation, LiquidationFile, Channel, ReconciliationDiscrepancy, CalimacoRecord, CollectorRecord, Role, UserRole],
        synchronize: false, // IMPORTANTE: false en produccion
        logging: configService.get('NODE_ENV') === 'development',
      }),
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
})
export class AppModule {}