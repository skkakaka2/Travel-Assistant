import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PlanItemType } from '../entities/day-plan-item.entity';
import { Type } from 'class-transformer';

export class CreateDayPlanItemDto {
  @ApiProperty({
    description: 'Day plan ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  dayPlanId: number;

  @ApiProperty({
    description: 'Trip ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  tripId: number;

  @ApiProperty({
    description: 'Item name',
    example: 'Visit the Great Wall',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Item type',
    example: 'ATTRACTION',
  })
  @IsEnum(PlanItemType)
  @IsNotEmpty()
  type: PlanItemType;

  @ApiProperty({
    description: 'Item address',
    example: 'Badaling, Beijing, China',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Item start time',
    example: '00：00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Item end time',
    example: '00:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  // @ApiProperty({
  //   description: 'Item duration',
  //   example: 180,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // duration: number;

  @ApiProperty({
    description: 'Item cost',
    example: 10000,
  })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiProperty({
    description: 'Item notes',
    example: 'Remember to bring water',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  //经纬度
  @ApiProperty({
    description: 'Item latitude',
    example: 39.90872,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;
  @ApiProperty({
    description: 'Item longitude',
    example: 116.39749,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
  @ApiProperty({
    description: 'Is holiday',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  isHoliday?: number;
}
