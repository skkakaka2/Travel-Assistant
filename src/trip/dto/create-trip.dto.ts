import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({
    description: '行程名称',
    example: '东京5日游',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '出行人数',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  userCount?: number;

  @ApiPropertyOptional({
    description: '预算（单位：元）',
    example: 10000,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: number;

  @ApiProperty({
    description: '计划开始时间（ISO 8601 格式）',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: '计划结束时间（ISO 8601 格式）',
    example: '2025-01-05T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: '行程备注',
    example: '这是一次愉快的旅行',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
