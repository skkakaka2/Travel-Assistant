import { PartialType } from '@nestjs/swagger';
import { CreateDayPlanItemDto } from './create-day-plan-item.dto';

export class UpdateDayPlanItemDto extends PartialType(CreateDayPlanItemDto) {}
