import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DeleteFileDto, GetFileDto, UploadFileDto } from './dto/create.dto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { MultipartFile } from '@fastify/multipart';

@Controller('upload-file')
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiBody({ type: UploadFileDto })
  @Post('upload')
  async uploadFile(@Req() request: FastifyRequest) {
    const parts = request.parts();
    return await this.fileSystemService.uploadFile(parts);
  }

  @ApiOperation({ summary: 'Delete file' })
  @ApiBody({ type: DeleteFileDto })
  @Delete('delete')
  async deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    return await this.fileSystemService.deleteFileToItem(deleteFileDto);
  }
}
