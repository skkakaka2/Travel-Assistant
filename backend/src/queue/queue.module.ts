import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getRedisConfig } from './queue.config';
import { QUEUE_NAMES } from './queue.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanItem } from 'src/day-plan-item/entities/day-plan-item.entity';
import { DistanceCalculationProcessor } from './processor/distance-calculation.processor';
import { DayPlan } from 'src/day-plan/entities/day-plan.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanItemModule } from 'src/day-plan-item/day-plan-item.module';

@Module({
  imports: [
    // BullMQ 全局配置
    BullModule.forRootAsync({
      useFactory: () => {
        const redisConfig = getRedisConfig();
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.DISTANCE_CALCULATION,
    }),
    // 为 Processor 提供 TypeORM repository
    TypeOrmModule.forFeature([DayPlanItem, DayPlan, Trip]),
    DayPlanItemModule,
  ],
  providers: [DistanceCalculationProcessor],
  exports: [BullModule],
})
export class QueueModule {}
