import { ApiProperty } from '@nestjs/swagger';
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
import { PlanItemType } from '../../day-plan-item/entities/day-plan-item.entity';

export class CreateDayPlanItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Visit the Great Wall',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Notes for this item',
    example: 'Remember to bring water',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Type of plan item',
    enum: PlanItemType,
    example: PlanItemType.ATTRACTION,
  })
  @IsEnum(PlanItemType)
  @IsNotEmpty()
  type: PlanItemType;

  @ApiProperty({
    description: 'Address of the location',
    example: 'Badaling, Beijing, China',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Start time (ISO 8601 format)',
    example: '09:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'End time (ISO 8601 format)',
    example: '12:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 180,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Cost in cents',
    example: 5000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class CreateDayPlanDto {
  @ApiProperty({
    description: 'Trip ID',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  tripId: number;

  @ApiProperty({
    description: 'Date of the day plan (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Day number in the trip',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  dayNumber: number;

  @ApiProperty({
    description: 'Notes for this day',
    example: 'First day of the trip',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
