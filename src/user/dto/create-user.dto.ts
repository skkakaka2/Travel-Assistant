import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    description: '密码',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @ApiProperty({
    description: '姓名',
    example: 'Admin User',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
