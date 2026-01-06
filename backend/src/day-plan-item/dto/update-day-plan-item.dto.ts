import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateDayPlanItemDto } from './create-day-plan-item.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PlanItemType } from '../entities/day-plan-item.entity';

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
    description: 'Cost in cents',
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({
    description: 'Latitude of the location',
    example: 39.90872,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude of the location',
    example: 116.39749,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
