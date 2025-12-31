import { Injectable } from '@nestjs/common';
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
import { DayPlanItem } from './entities/day-plan-item.entity';

@Injectable()
export class DayPlanService {
  constructor(
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
  ) {}

  async create(createDayPlanDto: CreateDayPlanDto) {
    const exist = await this.dayPlanRepository.findOne({
      where: {
        tripId: createDayPlanDto.tripId,
        date: createDayPlanDto.date,
      },
    });
    if (exist) {
      return errorResponse('Day plan already exists', null);
    }

    const items =
      createDayPlanDto.items?.map((item) =>
        this.dayPlanRepository.manager.create(DayPlanItem, {
          ...item,
          startTime: item.startTime ? new Date(item.startTime) : undefined,
          endTime: item.endTime ? new Date(item.endTime) : undefined,
        }),
      ) ?? [];

    const dayPlan = this.dayPlanRepository.create({
      tripId: createDayPlanDto.tripId,
      date: createDayPlanDto.date,
      dayNumber: createDayPlanDto.dayNumber,
      notes: createDayPlanDto.notes,
      items,
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
      relations: ['items'],
    });
    const paginationResponse = new PaginationResponse(
      result,
      total,
      query.page,
      query.pageSize,
    );
    return successResponse(paginationResponse);
  }

  async findOne(id: number) {
    return `This action returns a #${id} dayPlan`;
  }

  async update(id: number, updateDayPlanDto: UpdateDayPlanDto) {
    return `This action updates a #${id} dayPlan`;
  }

  async remove(id: number) {
    return `This action removes a #${id} dayPlan`;
  }
}
