import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}
  create(createTripDto: CreateTripDto, user: ContextUser) {
    const data = {
      ...createTripDto,
      userId: user.userId,
    };
    return this.prisma.trip.create({
      data,
    });
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
