import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { PlanItemType } from '../../day-plan-item/entities/day-plan-item.entity';

export class UpdateDayPlanItemDto {
  @ApiPropertyOptional({
    description: 'Item ID (required for updating existing items)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({
    description: 'Item name',
    example: 'Visit the Great Wall',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Notes for this item',
    example: 'Remember to bring water',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Type of plan item',
    enum: PlanItemType,
    example: PlanItemType.ATTRACTION,
  })
  @IsEnum(PlanItemType)
  @IsOptional()
  type?: PlanItemType;

  @ApiPropertyOptional({
    description: 'Address of the location',
    example: 'Badaling, Beijing, China',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Start time (ISO 8601 format)',
    example: '09:00',
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (ISO 8601 format)',
    example: '12:00',
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Duration in minutes',
    example: 180,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Cost in cents',
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class UpdateDayPlanDto {
  @ApiPropertyOptional({
    description: 'Date of the day plan (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsString()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Day number in the trip',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  dayNumber?: number;

  @ApiPropertyOptional({
    description: 'Notes for this day',
    example: 'First day of the trip',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Is holiday',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isHoliday?: number;
}
