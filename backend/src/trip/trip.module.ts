import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TripExportService } from './trip-export.service';
import { Trip } from './entities/trip.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, User])],
  controllers: [TripController],
  providers: [TripService, TripExportService],
  exports: [TripExportService],
})
export class TripModule {}
