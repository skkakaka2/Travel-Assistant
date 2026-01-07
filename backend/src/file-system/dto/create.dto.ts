import { ApiProperty } from '@nestjs/swagger';
import type { Multipart as FastifyMultipart } from '@fastify/multipart';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'File',
    format: 'binary',
  })
  @IsNotEmpty()
  file: FastifyMultipart;
}

export class DeleteFileDto {
  @ApiProperty({
    description: 'Item ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({
    description: 'Filepath',
    example: 'uploads/1234567890.jpg',
  })
  @IsNotEmpty()
  @IsString()
  filepath: string;
}

export class GetFileDto {
  @ApiProperty({
    description: 'Filepath',
    example: 'uploads/1234567890.jpg',
  })
  @IsNotEmpty()
  @IsString()
  path: string;
}
