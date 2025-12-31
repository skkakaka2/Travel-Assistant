import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanService } from './day-plan.service';
import { DayPlanController } from './day-plan.controller';
import { DayPlan } from './entities/day-plan.entity';
import { DayPlanItem } from '../day-plan-item/entities/day-plan-item.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanItemService } from 'src/day-plan-item/day-plan-item.service';

@Module({
  imports: [TypeOrmModule.forFeature([DayPlan, DayPlanItem, Trip])],
  controllers: [DayPlanController],
  providers: [DayPlanService, DayPlanItemService],
})
export class DayPlanModule {}
