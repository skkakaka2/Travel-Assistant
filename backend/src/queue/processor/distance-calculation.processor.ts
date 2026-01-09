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
import { Trip } from 'src/trip/entities/trip.entity';
import { userInfo } from 'os';

@Processor(QUEUE_NAMES.DISTANCE_CALCULATION, { concurrency: 1 })
export class DistanceCalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(DistanceCalculationProcessor.name);

  constructor(
    @InjectRepository(DayPlanItem)
    private readonly dayPlanItemRepository: Repository<DayPlanItem>,
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
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
    this.logger.log(`Calculating distance for trip ${data.tripId}`);
    const { tripId } = data;
    const tripInfo = await this.tripRepository.findOne({
      where: {
        id: tripId,
      },
      relations: {
        dayPlans: {
          dayPlanItems: true,
        },
      },
      order: {
        dayPlans: {
          dayPlanItems: {
            startTime: 'ASC',
          },
        },
      },
    });
    if (!tripInfo) {
      throw new Error('Trip not found');
    }
    const itemAll = tripInfo.dayPlans.flatMap(
      (dayPlan) => dayPlan.dayPlanItems,
    );
    for (let index = 0; index < itemAll.length; index++) {
      const item = itemAll[index];
      if (!item.latitude || !item.longitude) {
        continue;
      }

      let result: RouteResult;
      if (index === 0) {
        const start = {
          latitude: data.userInfo.homeLatitude!,
          longitude: data.userInfo.homeLongitude!,
        };
        result = await this.calculateDrivingDistance(start, {
          latitude: item.latitude,
          longitude: item.longitude,
        });
      } else {
        const prevItem = itemAll[index - 1];
        result = await this.calculateDrivingDistance(
          { latitude: prevItem.latitude!, longitude: prevItem.longitude! },
          { latitude: item.latitude, longitude: item.longitude },
        );
      }
      item.distance = result.distance;
      item.duration = result.duration;
      await this.dayPlanItemRepository.update(item.id, {
        distance: result.distance,
        duration: result.duration,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    // 更新所有相关的 dayPlan
    for (const dayPlan of tripInfo.dayPlans) {
      const dayPlanItems = itemAll.filter(
        (item) => item.dayPlanId === dayPlan.id,
      );
      const dayPlanDistance = dayPlanItems.reduce(
        (acc, item) => acc + (item.distance || 0),
        0,
      );
      const dayPlanDuration = dayPlanItems.reduce(
        (acc, item) => acc + (item.duration || 0),
        0,
      );

      await this.dayPlanRepository.update(dayPlan.id, {
        distance: dayPlanDistance,
        duration: dayPlanDuration,
      });
    }
  }

  async calculateDrivingDistance(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
  ): Promise<RouteResult> {
    const BAIDU_AK = process.env.BAIDU_MAP_SERVER_AK;
    if (!BAIDU_AK) {
      this.logger.error('BAIDU_MAP_SERVER_AK is not configured');
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
