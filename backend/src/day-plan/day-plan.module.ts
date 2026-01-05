import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanService } from './day-plan.service';
import { DayPlanController } from './day-plan.controller';
import { DayPlan } from './entities/day-plan.entity';
import { DayPlanItem } from '../day-plan-item/entities/day-plan-item.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { UserModule } from 'src/user/user.module';
import { DayPlanItemModule } from 'src/day-plan-item/day-plan-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DayPlan, DayPlanItem, Trip]),
    UserModule,
    DayPlanItemModule,
  ],
  controllers: [DayPlanController],
  providers: [DayPlanService],
})
export class DayPlanModule {}
