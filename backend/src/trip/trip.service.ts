import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { PaginationQuery, PaginationResponse } from 'src/common/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}
  async create(createTripDto: CreateTripDto, user: ContextUser) {
    const existTrip = await this.tripRepository.findOne({
      where: {
        name: createTripDto.name,
      },
    });
    if (existTrip) {
      return errorResponse('Trip already exists', null);
    }
    const data = this.tripRepository.create({
      ...createTripDto,
      userId: Number(user.userId),
    });
    const trip = await this.tripRepository.save(data);
    return successResponse(trip);
  }

  async findAll(paginationQuery: PaginationQuery) {
    const [result, total] = await this.tripRepository.findAndCount({
      skip: (paginationQuery.page - 1) * paginationQuery.pageSize,
      take: paginationQuery.pageSize,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        dayPlans: true,
      },
    });
    const paginationResponse = new PaginationResponse(
      result,
      total,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
    return successResponse(paginationResponse);
  }

  async findOne(id: number) {
    const result = await this.tripRepository.findOne({
      where: {
        id,
      },
      relations: {
        dayPlans: true,
      },
    });
    if (!result) {
      return errorResponse('Trip not found', null);
    }
    return successResponse(result);
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
