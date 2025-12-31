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
    description: 'Trip name',
    example: 'Tokyo 5-Day Tour',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Number of travelers',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  userCount?: number;

  @ApiPropertyOptional({
    description: 'Budget (in cents)',
    example: 10000,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: number;

  @ApiProperty({
    description: 'Start date (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO 8601 format)',
    example: '2025-01-05T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Trip description',
    example: 'A wonderful trip',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
