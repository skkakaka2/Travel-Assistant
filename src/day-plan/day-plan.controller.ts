import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DayPlanService } from './day-plan.service';
import { CreateDayPlanDto } from './dto/create-day-plan.dto';
import { UpdateDayPlanDto } from './dto/update-day-plan.dto';
import { ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationQuery } from 'src/common/pagination';

@Controller('dayplan')
export class DayPlanController {
  constructor(private readonly dayPlanService: DayPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a day plan' })
  @ApiBody({ type: CreateDayPlanDto })
  create(@Body() createDayPlanDto: CreateDayPlanDto) {
    return this.dayPlanService.create(createDayPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all day plans' })
  @ApiQuery({ name: 'query', type: PaginationQuery })
  findAll(@Query() query: PaginationQuery) {
    return this.dayPlanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a day plan by id' })
  @ApiParam({
    name: 'id',
    description: 'Day plan ID',
    type: Number,
    example: 1,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dayPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a day plan' })
  @ApiParam({
    type: Number,
    name: 'id',
    description: 'Day plan ID',
    example: 1,
  })
  @ApiBody({ type: UpdateDayPlanDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDayPlanDto: UpdateDayPlanDto,
  ) {
    return this.dayPlanService.update(id, updateDayPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a day plan' })
  @ApiParam({
    type: Number,
    name: 'id',
    description: 'Day plan ID',
    example: 1,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dayPlanService.remove(id);
  }
}
