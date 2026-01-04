import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    description: 'Password',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @ApiProperty({
    description: 'Full name',
    example: 'Admin User',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  avatar: string;
}

export class SetHomeDto {
  @ApiProperty({
    description: 'Home address',
    example: '123 Main St, Anytown, USA',
  })
  @IsString()
  @IsNotEmpty()
  homeAddress: string;
  @ApiProperty({
    description: 'Home latitude',
    example: 39.90872,
  })
  @IsNumber()
  @IsNotEmpty()
  homeLatitude: number;
  @ApiProperty({
    description: 'Home longitude',
    example: 123.456789,
  })
  @IsNumber()
  @IsNotEmpty()
  homeLongitude: number;
}
