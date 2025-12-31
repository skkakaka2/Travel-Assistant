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

    // 只检查输入了 startTime 和 endTime 的情况
    if (startTime && endTime) {
      if (endTime === startTime) {
        return errorResponse('活动时间最少1小时', null);
      }
      // 查找所有同一个 dayPlanId 的 item
      const items = await this.dayPlanItemRepository.find({
        where: { dayPlanId },
      });

      // 对所有找到的 item 做重叠判断
      const isOverlap = items.some((item) => {
        if (!item.startTime || !item.endTime) return false;
        return startTime < item.endTime && item.startTime < endTime;
      });

      if (isOverlap) {
        return errorResponse('存在时间重叠的行程', null);
      }
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
    return successResponse(result);
  }

  update(id: number, updateDayPlanItemDto: UpdateDayPlanItemDto) {
    return `This action updates a #${id} dayPlanItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} dayPlanItem`;
  }
}
