import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import { errorResponse, successResponse } from 'src/http-response/http-response';

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

  findAll() {
    return `This action returns all trip`;
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
