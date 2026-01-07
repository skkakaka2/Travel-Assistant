import { Multipart, MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { DayPlanItem } from 'src/day-plan-item/entities/day-plan-item.entity';
import { Repository } from 'typeorm';
import { pipeline } from 'stream/promises';
import { DeleteFileDto } from './dto/create.dto';

@Injectable()
export class FileSystemService {
  constructor(
    @InjectRepository(DayPlanItem)
    private readonly dayPlanItemRepository: Repository<DayPlanItem>,
  ) {}

  async uploadFile(parts: AsyncIterableIterator<Multipart>) {
    const fields: Record<string, any> = {};
    let savedFilePath: string | null = null;
    let uniqueName = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        const filename = part.filename;
        const ext = path.extname(filename).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

        if (!allowedExts.includes(ext)) {
          // 丢弃流，不占用内存
          part.file.resume();
          throw new Error('只能上传图片格式');
        }

        // 生成唯一文件名，避免重名覆盖
        uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        savedFilePath = path.join(process.cwd(), 'uploads', uniqueName);
        await pipeline(part.file, createWriteStream(savedFilePath));
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!savedFilePath) {
      return errorResponse('未上传文件', null);
    }

    if (!fields.itemId) {
      return errorResponse('itemId参数未传', null);
    }

    return await this.relateFileToItem(Number(fields.itemId), uniqueName);
  }

  async relateFileToItem(itemId: number, filename: string) {
    const item = await this.dayPlanItemRepository.findOne({
      where: {
        id: itemId,
      },
    });
    if (!item) {
      return errorResponse('Item not found', null);
    }
    if (!item.imgList) {
      item.imgList = [];
    }
    item.imgList.push(filename);
    const result = await this.dayPlanItemRepository.save(item);
    return successResponse(result);
  }

  async deleteFileToItem(data: DeleteFileDto) {
    const item = await this.dayPlanItemRepository.findOne({
      where: {
        id: data.itemId,
      },
    });
    if (!item) {
      return errorResponse('Item not found', null);
    }
    if (!item.imgList) {
      item.imgList = [];
    }
    item.imgList = item.imgList.filter((img) => img !== data.filepath);
    const result = await this.dayPlanItemRepository.save(item);
    return successResponse(result);
  }
}
