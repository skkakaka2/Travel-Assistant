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
import { Trip } from 'src/trip/entities/trip.entity';

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

    if (dayPlan.isHoliday === 1) {
      createDayPlanItemDto.isHoliday = 1;
    } else {
      createDayPlanItemDto.isHoliday = 0;
    }

    const result = this.dayPlanItemRepository.create({
      ...createDayPlanItemDto,
      userId: Number(user.userId),
    });
    const savedResult = await this.dayPlanItemRepository.save(result);

    // 计算里程和时间
    await this.calculateItemDistanceAndTime(savedResult.tripId, userInfo!);

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
        await this.calculateItemDistanceAndTime(updatedItem.tripId, userInfo!);
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
    if (distance && duration && (distance > 0 || duration > 0)) {
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
    const userInfo = await this.userRepository.findOne({
      where: {
        id: dayPlan.userId,
      },
    });
    await this.calculateItemDistanceAndTime(exist.tripId, userInfo!);
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

  async uploadImg(itemId: number, img: string) {
    const exist = await this.dayPlanItemRepository.findOne({
      where: {
        id: itemId,
      },
    });
    if (!exist) {
      return errorResponse('Day plan item not found', null);
    }
  }

  /**
   * 计算行程项的里程和时间
   */
  private async calculateItemDistanceAndTime(
    tripId: number,
    userInfo: User,
  ): Promise<void> {
    this.distanceCalculationQueue.add(JOB_NAMES.CALCULATE_ITEM_DISTANCE, {
      tripId,
      userInfo,
    });
  }

  //预测行程花费（油费+过路费）
  async predictTripCost(item: DayPlanItem, userInfo: User): Promise<number> {
    const userRow = await this.userRepository.findOne({
      where: {
        id: userInfo.id,
      },
    });
    const dayPlan = await this.dayPlanRepository.findOne({
      where: {
        id: item.dayPlanId,
      },
    });
    const distance = item.distance ?? 0;
    let roadCost = 0;
    if (dayPlan!.isHoliday === 1) {
      roadCost = 0;
    }
    const carCost = distance * userRow!.perKilometerCost!;
    const totalCost = roadCost + carCost;
    return parseInt(totalCost.toFixed(0));
  }
}
