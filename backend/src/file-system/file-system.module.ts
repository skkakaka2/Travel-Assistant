import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { FileSystemController } from './file-system.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanItem } from 'src/day-plan-item/entities/day-plan-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DayPlanItem])],
  controllers: [FileSystemController],
  providers: [FileSystemService],
  exports: [FileSystemModule],
})
export class FileSystemModule {}
