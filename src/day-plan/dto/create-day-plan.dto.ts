import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { PlanItemType } from '../entities/day-plan-item.entity';

export class CreateDayPlanItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(PlanItemType)
  @IsNotEmpty()
  type: PlanItemType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class CreateDayPlanDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  tripId: number;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  dayNumber: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDayPlanItemDto)
  items?: CreateDayPlanItemDto[];
}
