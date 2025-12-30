import { Injectable } from '@nestjs/common';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { UpdateDayPlanDto } from './dto/update-day-plan.dto';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQuery, PaginationResponse } from 'src/common/pagination';

@Injectable()
export class DayPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDayPlanDto: CreateDayPlanDto) {
    const exist = await this.prisma.dayPlan.findFirst({
      where: {
        date: createDayPlanDto.date,
      },
    });
    if (exist) {
      return errorResponse('Day plan already exists', null);
    }
    const dayPlan = await this.prisma.dayPlan.create({
      data: createDayPlanDto,
    });
    return successResponse(dayPlan);
  }

  async findAll(query: PaginationQuery) {
    const result = await this.prisma.dayPlan.findMany({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: {
        date: 'desc',
      },
      include: {
        items: true,
      },
    });
    const total = await this.prisma.dayPlan.count();
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
