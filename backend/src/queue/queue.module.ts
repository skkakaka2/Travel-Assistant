import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getRedisConfig } from './queue.config';
import { QUEUE_NAMES } from './queue.constants';

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
    // 注册距离计算队列
    BullModule.registerQueue({
      name: QUEUE_NAMES.DISTANCE_CALCULATION,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}

