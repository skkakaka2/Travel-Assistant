import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RouteResult } from 'src/common/distance.util';
import { DayPlanItem } from 'src/day-plan-item/entities/day-plan-item.entity';
import { DayPlan } from 'src/day-plan/entities/day-plan.entity';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { CalculateItemDistanceJob } from '../queue.types';
import { Repository } from 'typeorm';

@Processor(QUEUE_NAMES.DISTANCE_CALCULATION, { concurrency: 1 })
export class DistanceCalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(DistanceCalculationProcessor.name);

  constructor(
    @InjectRepository(DayPlanItem)
    private readonly dayPlanItemRepository: Repository<DayPlanItem>,
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
  ) {
    super();
  }

  async process(job: Job<CalculateItemDistanceJob>) {
    this.logger.log(`Processing job: ${job.name}, Job ID: ${job.id}`);
    try {
      switch (job.name) {
        case JOB_NAMES.CALCULATE_ITEM_DISTANCE:
          return await this.calculateItemDistance(job.data);
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
          return null;
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async calculateItemDistance(data: CalculateItemDistanceJob) {
    this.logger.log(
      `Calculating distance for item ${data.itemId}, dayPlan ${data.dayPlanId}`,
    );
    this.logger.debug(`Start: ${data.start.latitude}, ${data.start.longitude}`);
    this.logger.debug(`End: ${data.end.latitude}, ${data.end.longitude}`);

    const { start, end } = data;
    const { distance, duration } = await this.calculateDrivingDistance(
      start,
      end,
    );

    if (distance !== -1 && duration) {
      this.logger.log(
        `Distance calculated: ${distance}m, Duration: ${duration}s for item ${data.itemId}`,
      );

      // 更新 item 的距离和时间
      await this.dayPlanItemRepository.update(data.itemId, {
        distance,
        duration,
      });
      this.logger.debug(`Updated item ${data.itemId} with distance and duration`);

      // 更新 dayplan 的总距离和时间
      const dayplan = await this.dayPlanRepository.findOne({
        where: {
          id: data.dayPlanId,
        },
      });

      if (dayplan) {
        const previousDistance = dayplan.distance || 0;
        const previousDuration = dayplan.duration || 0;
        // 使用 update 方法而不是 save，避免外键约束问题
        await this.dayPlanRepository.update(data.dayPlanId, {
          distance: (previousDistance || 0) + distance,
          duration: (previousDuration || 0) + duration,
        });
        this.logger.log(
          `Updated dayPlan ${data.dayPlanId}: distance ${previousDistance} -> ${dayplan.distance}, duration ${previousDuration} -> ${dayplan.duration}`,
        );
      } else {
        this.logger.warn(`DayPlan ${data.dayPlanId} not found`);
      }
    } else {
      this.logger.warn(
        `Failed to calculate distance for item ${data.itemId}: distance=${distance}, duration=${duration}`,
      );
    }

    return distance;
  }

  async calculateDrivingDistance(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
  ): Promise<RouteResult> {
    const BAIDU_AK = process.env.BAIDU_MAP_AK;
    if (!BAIDU_AK) {
      this.logger.error('BAIDU_MAP_AK is not configured');
      return {
        distance: -1,
        duration: 0,
      };
    }

    const url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&ak=${BAIDU_AK}`;
    this.logger.debug(`Requesting Baidu API: ${url.replace(BAIDU_AK, '***')}`);

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (
        data.status === 0 &&
        data.result &&
        data.result.routes &&
        data.result.routes.length > 0
      ) {
        const result = data.result.routes[0];
        this.logger.debug(
          `Baidu API success: distance=${result.distance}m, duration=${result.duration}s`,
        );
        return {
          distance: result.distance,
          duration: result.duration,
        };
      } else {
        this.logger.warn(
          `Baidu API returned error: status=${data.status}, message=${data.message || 'Unknown error'}`,
        );
        return {
          distance: -1,
          duration: 0,
        };
      }
    } catch (err) {
      this.logger.error(
        `Error calling Baidu API: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      return {
        distance: -1,
        duration: 0,
      };
    }
  }
}
