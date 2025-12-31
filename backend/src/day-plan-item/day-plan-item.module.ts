import { Module } from '@nestjs/common';
import { DayPlanItemService } from './day-plan-item.service';
import { DayPlanItemController } from './day-plan-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanItem } from './entities/day-plan-item.entity';
import { DayPlan } from 'src/day-plan/entities/day-plan.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanModule } from 'src/day-plan/day-plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DayPlan, DayPlanItem, Trip]),
  ],
  controllers: [DayPlanItemController],
  providers: [DayPlanItemService],
})
export class DayPlanItemModule {}
