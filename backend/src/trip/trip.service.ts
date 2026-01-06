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
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const userInfo = await this.userRepository.findOne({
      where: {
        id: user.userId,
      },
    });
    if (
      !userInfo?.homeLatitude ||
      !userInfo?.homeLongitude ||
      !userInfo?.homeAddress
    ) {
      return errorResponse('请先在用户设置中设置家的位置', null);
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
        dayPlans: {
          dayPlanItems: true,
        },
      },
    });
    if (!result) {
      return errorResponse('Trip not found', null);
    }
    result.dayPlans.forEach((dayPlan) => {
      dayPlan.dayPlanItems.sort((a, b) =>
        a.startTime!.localeCompare(b.startTime!),
      );
    });
    return successResponse(result);
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    const exist = await this.tripRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Trip not found', null);
    }
    const result = await this.tripRepository.update(id, updateTripDto);
    return successResponse(result);
  }

  async remove(id: number) {
    const exist = await this.tripRepository.findOne({
      where: {
        id,
      },
    });
    if (!exist) {
      return errorResponse('Trip not found', null);
    }
    const result = await this.tripRepository.delete(id);
    return successResponse(result);
  }
}
