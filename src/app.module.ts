import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationsModule } from './conciliations/conciliations.module';
import { LiquidationsModule } from './liquidations/liquidations.module';

// Entities
import { Collector } from './entities/collector.entity';
import { User } from './entities/user.entity';
import { Conciliation } from './entities/conciliation.entity';
import { ConciliationFile } from './entities/conciliation-file.entity';
import { Liquidation } from './entities/liquidation.entity';
import { LiquidationFile } from './entities/liquidation-file.entity';
import { Channel } from './entities/channel.entity';


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
        entities: [Collector, User, Conciliation, ConciliationFile, Liquidation, LiquidationFile, Channel],
        synchronize: false, // IMPORTANTE: false en produccion
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ConciliationsModule,
    LiquidationsModule,
  ],
})
export class AppModule {}