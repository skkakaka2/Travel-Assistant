import { PlanItemType } from '@prisma/client';
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

export type PlanItemTypeEnum = PlanItemType;
export const PlanItemTypeEnum = Object.values(PlanItemType);

export class CreateDayPlanItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsOptional()
  notes?: string;
  @IsEnum(PlanItemTypeEnum)
  @IsNotEmpty()
  type: PlanItemTypeEnum;
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
    
  tripId: number;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  dayNumber: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
