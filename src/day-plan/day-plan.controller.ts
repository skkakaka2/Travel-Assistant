import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DayPlanService } from './day-plan.service';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { UpdateDayPlanDto } from './dto/update-day-plan.dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { PaginationQuery } from 'src/common/pagination';

@Controller('day-plan')
export class DayPlanController {
  constructor(private readonly dayPlanService: DayPlanService) {}

  @Post()
  @ApiOperation({ summary: '创建每日计划' })
  @ApiBody({ type: CreateDayPlanDto })
  create(@Body() createDayPlanDto: CreateDayPlanDto) {
    return this.dayPlanService.create(createDayPlanDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有每日计划' })
  findAll(@Query() query: PaginationQuery) {
    return this.dayPlanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dayPlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDayPlanDto: UpdateDayPlanDto) {
    return this.dayPlanService.update(+id, updateDayPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dayPlanService.remove(+id);
  }
}
