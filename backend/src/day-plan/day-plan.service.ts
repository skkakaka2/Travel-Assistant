import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { UpdateDayPlanDto } from './dto/update-day-plan.dto';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { PaginationQuery, PaginationResponse } from 'src/common/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { DayPlan } from './entities/day-plan.entity';
import { Repository } from 'typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanItemService } from 'src/day-plan-item/day-plan-item.service';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';

@Injectable()
export class DayPlanService {
  constructor(
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @Inject(forwardRef(() => DayPlanItemService))
    private readonly dayPlanItemService: DayPlanItemService,
  ) {}

  async create(createDayPlanDto: CreateDayPlanDto, user: ContextUser) {
    const trip = await this.tripRepository.findOne({
      where: {
        id: createDayPlanDto.tripId,
      },
    });
    if (!trip) {
      return errorResponse('Trip not found', null);
    }
    if (
      createDayPlanDto.date < trip.startDate ||
      createDayPlanDto.date > trip.endDate
    ) {
      return errorResponse('Date is not in the trip range', null);
    }
    const exist = await this.dayPlanRepository.findOne({
      where: {
        tripId: createDayPlanDto.tripId,
        date: createDayPlanDto.date,
      },
    });
    if (exist) {
      return errorResponse('Day plan already exists', null);
    }
    //如果dayplan不是第一天且前一天未添加任何item则阻止
    if (createDayPlanDto.dayNumber > 1) {
      const previousDayPlan = await this.dayPlanRepository.findOne({
        where: {
          tripId: createDayPlanDto.tripId,
          dayNumber: createDayPlanDto.dayNumber - 1,
        },
      });
      if (previousDayPlan) {
        const previousDayPlanItems =
          await this.dayPlanItemService.findAllByDayPlanId(previousDayPlan.id);
        if (previousDayPlanItems.length === 0) {
          return errorResponse('前一天未添加任何行程，请先完成前一天的行程', null);
        }
      }
    }

    const dayPlan = this.dayPlanRepository.create({
      tripId: createDayPlanDto.tripId,
      date: createDayPlanDto.date,
      dayNumber: createDayPlanDto.dayNumber,
      notes: createDayPlanDto.notes,
      userId: Number(user.userId),
    });

    const result = await this.dayPlanRepository.save(dayPlan);
    return successResponse(result);
  }

  async findAll(query: PaginationQuery) {
    const [result, total] = await this.dayPlanRepository.findAndCount({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      order: {
        date: 'DESC',
      },
    });
    const paginationResponse = new PaginationResponse(
      result,
      total,
      query.page,
      query.pageSize,
    );
    return successResponse(paginationResponse);
  }

  async findAllItems(dayPlanId: number) {
    const result = await this.dayPlanItemService.findAllByDayPlanId(dayPlanId);
    return successResponse(result);
  }

  async findOne(id: number) {
    const result = await this.dayPlanRepository.findOne({
      where: {
        id,
      },
    });
    return successResponse(result);
  }

  async update(id: number, updateDayPlanDto: UpdateDayPlanDto) {
    const exist = await this.dayPlanRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Day plan not found', null);
    }
    const result = await this.dayPlanRepository.update(id, updateDayPlanDto);
    return successResponse(result);
  }

  async remove(id: number) {
    const exist = await this.dayPlanRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Day plan not found', null);
    }
    const result = await this.dayPlanRepository.delete(id);
    return successResponse(result);
  }
}
