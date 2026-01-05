import { Injectable } from '@nestjs/common';
import { CreateDayPlanItemDto } from './dto/create-day-plan-item.dto';
import { UpdateDayPlanItemDto } from './dto/update-day-plan-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { Repository } from 'typeorm';
import { DayPlanItem } from './entities/day-plan-item.entity';
import { DayPlanService } from 'src/day-plan/day-plan.service';
import { DayPlan } from 'src/day-plan/entities/day-plan.entity';
import { User } from 'src/user/entities/user.entity';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import { RouteResult } from 'src/common/distance.util';
import { InjectQueue } from '@nestjs/bullmq';
import { CalculateItemDistanceJob, JOB_NAMES, QUEUE_NAMES } from 'src/queue';
import { Queue } from 'bullmq';

@Injectable()
export class DayPlanItemService {
  constructor(
    @InjectRepository(DayPlanItem)
    private readonly dayPlanItemRepository: Repository<DayPlanItem>,

    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectQueue(QUEUE_NAMES.DISTANCE_CALCULATION)
    private readonly distanceCalculationQueue: Queue<CalculateItemDistanceJob>,
  ) {}

  async create(createDayPlanItemDto: CreateDayPlanItemDto, user: ContextUser) {
    const dayPlan = await this.dayPlanRepository.findOne({
      where: {
        id: createDayPlanItemDto.dayPlanId,
      },
    });
    if (!dayPlan) {
      return errorResponse('Day plan not found', null);
    }
    const userInfo = await this.userRepository.findOne({
      where: {
        id: user.userId,
      },
    });
    // 检查同一 dayPlanId 下是否有时间重叠的项
    const { dayPlanId, startTime, endTime } = createDayPlanItemDto;

    const { check, message } = this.checkTime(startTime, endTime);
    if (!check) {
      return errorResponse(message, null);
    }

    const items = await this.dayPlanItemRepository.find({
      where: { dayPlanId },
      order: {
        order: 'ASC',
      },
    });

    const isOverlap = this.checkOverlap(startTime, endTime, items);
    if (isOverlap) {
      return errorResponse('存在时间重叠的行程', null);
    }
    const result = this.dayPlanItemRepository.create({
      ...createDayPlanItemDto,
      userId: Number(user.userId),
    });
    const savedResult = await this.dayPlanItemRepository.save(result);

    // 计算里程和时间
    await this.calculateItemDistanceAndTime(
      savedResult,
      dayPlan,
      items,
      userInfo,
      createDayPlanItemDto.latitude,
      createDayPlanItemDto.longitude,
    );

    return successResponse(savedResult);
  }

  findAll() {
    return `This action returns all dayPlanItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dayPlanItem`;
  }

  async findAllByDayPlanId(dayPlanId: number) {
    const result = await this.dayPlanItemRepository.find({
      where: {
        dayPlanId,
      },
      order: {
        order: 'ASC',
      },
    });
    return result;
  }

  async update(id: number, updateDayPlanItemDto: UpdateDayPlanItemDto) {
    const exist = await this.dayPlanItemRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Day plan item not found', null);
    }
    const dayPlan = await this.dayPlanRepository.findOne({
      where: {
        id: exist.dayPlanId,
      },
    });
    if (!dayPlan) {
      return errorResponse('Day plan not found', null);
    }
    const { check, message } = this.checkTime(
      updateDayPlanItemDto.startTime!,
      updateDayPlanItemDto.endTime!,
    );
    if (!check) {
      return errorResponse(message, null);
    }

    const { startTime, endTime } = updateDayPlanItemDto;
    const items = await this.dayPlanItemRepository.find({
      where: {
        dayPlanId: exist.dayPlanId,
      },
    });
    const isOverlap = this.checkOverlap(
      startTime!,
      endTime!,
      items.filter((item) => item.id !== id),
    );
    if (isOverlap) {
      return errorResponse('存在时间重叠的行程', null);
    }

    const result = await this.dayPlanItemRepository.update(
      id,
      updateDayPlanItemDto,
    );

    // 如果更新了经纬度，需要重新计算距离
    if (updateDayPlanItemDto.latitude || updateDayPlanItemDto.longitude) {
      // 获取更新后的 item 数据
      const updatedItem = await this.dayPlanItemRepository.findOne({
        where: { id },
      });
      if (!updatedItem) {
        return errorResponse('Day plan item not found after update', null);
      }

      // 获取用户信息（从 dayPlan 获取 userId）
      const userInfo = await this.userRepository.findOne({
        where: {
          id: dayPlan.userId,
        },
      });

      // 重新获取 items（排除当前 item）
      const otherItems = items.filter((item) => item.id !== id);

      const latitude =
        updateDayPlanItemDto.latitude ?? updatedItem.latitude ?? undefined;
      const longitude =
        updateDayPlanItemDto.longitude ?? updatedItem.longitude ?? undefined;

      if (latitude && longitude) {
        await this.calculateItemDistanceAndTime(
          updatedItem,
          dayPlan,
          otherItems,
          userInfo,
          latitude,
          longitude,
        );
      }
    }

    return successResponse(result);
  }

  async remove(id: number) {
    const exist = await this.dayPlanItemRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Day plan item not found', null);
    }
    const dayPlan = await this.dayPlanRepository.findOne({
      where: {
        id: exist.dayPlanId,
      },
    });
    if (!dayPlan) {
      return errorResponse('Day plan not found', null);
    }
    const { distance, duration } = exist;
    if (distance > 0 || duration > 0) {
      const newDistance =
        dayPlan.distance! - distance < 0
          ? 0
          : Math.floor(dayPlan.distance! - distance);
      const newDuration =
        dayPlan.duration! - duration < 0
          ? 0
          : Math.floor(dayPlan.duration! - duration);
      await this.dayPlanRepository.update(exist.dayPlanId, {
        distance: newDistance,
        duration: newDuration,
      });
    }
    const result = await this.dayPlanItemRepository.delete(id);
    return successResponse(result);
  }

  checkTime(startTime: string, endTime: string) {
    if (endTime === startTime) {
      return {
        check: false,
        message: '活动时间最少1小时',
      };
    }
    if (endTime < startTime) {
      return {
        check: false,
        message: '结束时间不能小于开始时间',
      };
    }
    return {
      check: true,
      message: '时间合法',
    };
  }

  checkOverlap(startTime: string, endTime: string, items: DayPlanItem[]) {
    return items.some((item) => {
      if (!item.startTime || !item.endTime) return false;
      return startTime < item.endTime && item.startTime < endTime;
    });
  }

  /**
   * 计算行程项的里程和时间
   * @param item 新创建的行程项
   * @param dayPlan 所属的日程计划
   * @param existingItems 当前日程计划中已存在的行程项
   * @param userInfo 用户信息（用于获取家庭地址）
   * @param endLatitude 目的地纬度
   * @param endLongitude 目的地经度
   */
  private async calculateItemDistanceAndTime(
    item: DayPlanItem,
    dayPlan: DayPlan,
    existingItems: DayPlanItem[],
    userInfo: User | null,
    endLatitude: string | number | undefined,
    endLongitude: string | number | undefined,
  ): Promise<void> {
    // 如果没有经纬度信息，不计算距离
    if (!endLatitude || !endLongitude) {
      return;
    }

    let startLatitude: number | undefined;
    let startLongitude: number | undefined;

    // 第一天且没有行程时，计算起点（用户家庭地址）到第一个行程的距离
    if (dayPlan.dayNumber === 1 && existingItems.length === 0) {
      if (!userInfo?.homeLatitude || !userInfo?.homeLongitude) {
        return;
      }
      startLatitude = userInfo.homeLatitude;
      startLongitude = userInfo.homeLongitude;
    } else if (existingItems.length > 0) {
      // 有行程时，计算前一个行程到当前行程的距离
      const previousItem = existingItems[existingItems.length - 1];
      if (previousItem?.latitude && previousItem?.longitude) {
        startLatitude =
          typeof previousItem.latitude === 'string'
            ? parseFloat(previousItem.latitude)
            : previousItem.latitude;
        startLongitude =
          typeof previousItem.longitude === 'string'
            ? parseFloat(previousItem.longitude)
            : previousItem.longitude;
      }
    } else if (dayPlan.dayNumber > 1) {
      // 没有行程且非第一天的行程时，要计算前一天的最后一个行程的距离
      const previousDayPlan = await this.dayPlanRepository.findOne({
        where: {
          tripId: dayPlan.tripId,
          dayNumber: dayPlan.dayNumber - 1,
        },
      });

      if (previousDayPlan) {
        // 查找前一天的最后一个行程
        const previousItems = await this.dayPlanItemRepository.find({
          where: {
            dayPlanId: previousDayPlan.id,
          },
          order: {
            order: 'ASC',
          },
        });

        if (previousItems.length > 0) {
          const lastItem = previousItems[previousItems.length - 1];
          if (lastItem.latitude && lastItem.longitude) {
            startLatitude =
              typeof lastItem.latitude === 'string'
                ? parseFloat(lastItem.latitude)
                : lastItem.latitude;
            startLongitude =
              typeof lastItem.longitude === 'string'
                ? parseFloat(lastItem.longitude)
                : lastItem.longitude;
          }
        }
      }
    }

    // 如果找到了起点坐标，添加距离计算任务到队列
    if (startLatitude && startLongitude) {
      const endLat =
        typeof endLatitude === 'string' ? parseFloat(endLatitude) : endLatitude;
      const endLng =
        typeof endLongitude === 'string'
          ? parseFloat(endLongitude)
          : endLongitude;

      this.distanceCalculationQueue.add(JOB_NAMES.CALCULATE_ITEM_DISTANCE, {
        itemId: item.id,
        dayPlanId: dayPlan.id,
        tripId: dayPlan.tripId,
        start: {
          latitude: startLatitude,
          longitude: startLongitude,
        },
        end: {
          latitude: endLat,
          longitude: endLng,
        },
        order: item.order,
      });
    }
  }
}
