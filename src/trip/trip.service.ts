import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { PaginationQuery, PaginationResponse } from 'src/common/pagination';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createTripDto: CreateTripDto, user: ContextUser) {
    const existTrip = await this.prisma.trip.findFirst({
      where: {
        name: createTripDto.name,
      },
    });
    if (existTrip) {
      return errorResponse('Trip already exists', null);
    }
    const data = {
      ...createTripDto,
      userId: user.userId,
    };
    const trip = await this.prisma.trip.create({
      data,
    });
    return successResponse(trip);
  }

  async findAll(paginationQuery: PaginationQuery) {
    const result = await this.prisma.trip.findMany({
      skip: (paginationQuery.page - 1) * paginationQuery.pageSize,
      take: paginationQuery.pageSize,
    });
    const total = await this.prisma.trip.count();
    const paginationResponse = new PaginationResponse(
      result,
      total,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
    return successResponse(paginationResponse);
  }

  findOne(id: number) {
    return `This action returns a #${id} trip`;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
