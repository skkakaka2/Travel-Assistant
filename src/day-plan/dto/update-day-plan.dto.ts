import { PartialType } from '@nestjs/swagger';
import { CreateDayPlanDto } from './create-day-plan.dto';

export class UpdateDayPlanDto extends PartialType(CreateDayPlanDto) {}
