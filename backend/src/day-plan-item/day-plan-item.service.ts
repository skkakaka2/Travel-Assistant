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

@Injectable()
export class DayPlanItemService {
  constructor(
    @InjectRepository(DayPlanItem)
    private readonly dayPlanItemRepository: Repository<DayPlanItem>,

    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
  ) {}

  async create(createDayPlanItemDto: CreateDayPlanItemDto) {
    const dayPlan = await this.dayPlanRepository.findOne({
      where: {
        id: createDayPlanItemDto.dayPlanId,
      },
    });
    if (!dayPlan) {
      return errorResponse('Day plan not found', null);
    }
    // 检查同一 dayPlanId 下是否有时间重叠的项
    const { dayPlanId, startTime, endTime } = createDayPlanItemDto;

    const { check, message } = this.checkTime(startTime, endTime);
    if (!check) {
      return errorResponse(message, null);
    }

    const items = await this.dayPlanItemRepository.find({
      where: { dayPlanId },
    });

    const isOverlap = this.checkOverlap(startTime, endTime, items);
    if (isOverlap) {
      return errorResponse('存在时间重叠的行程', null);
    }
    const result = this.dayPlanItemRepository.create(createDayPlanItemDto);
    const savedResult = await this.dayPlanItemRepository.save(result);
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
    const isOverlap = this.checkOverlap(startTime!, endTime!, items);
    if (isOverlap) {
      return errorResponse('存在时间重叠的行程', null);
    }

    const result = await this.dayPlanItemRepository.update(
      id,
      updateDayPlanItemDto,
    );
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
}
