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
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanItemService } from 'src/day-plan-item/day-plan-item.service';

@Injectable()
export class DayPlanService {
  constructor(
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly dayPlanItemService: DayPlanItemService,
  ) {}

  async create(createDayPlanDto: CreateDayPlanDto) {
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

    const dayPlan = this.dayPlanRepository.create({
      tripId: createDayPlanDto.tripId,
      date: createDayPlanDto.date,
      dayNumber: createDayPlanDto.dayNumber,
      notes: createDayPlanDto.notes,
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
    return `This action updates a #${id} dayPlan`;
  }

  async remove(id: number) {
    return `This action removes a #${id} dayPlan`;
  }
}
