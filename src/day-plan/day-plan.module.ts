import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanService } from './day-plan.service';
import { DayPlanController } from './day-plan.controller';
import { DayPlan } from './entities/day-plan.entity';
import { DayPlanItem } from './entities/day-plan-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DayPlan, DayPlanItem])],
  controllers: [DayPlanController],
  providers: [DayPlanService],
})
export class DayPlanModule {}
