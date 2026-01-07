import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DayPlanItemService } from './day-plan-item.service';
import { CreateDayPlanItemDto } from './dto/create-day-plan-item.dto';
import { UpdateDayPlanItemDto } from './dto/update-day-plan-item.dto';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationQuery } from 'src/common/pagination';

@Controller('day-plan-item')
export class DayPlanItemController {
  constructor(private readonly dayPlanItemService: DayPlanItemService) {}

  @ApiOperation({ summary: 'Create a day plan item' })
  @ApiBody({ type: CreateDayPlanItemDto })
  @Post()
  create(
    @Body() createDayPlanItemDto: CreateDayPlanItemDto,
    @ContextUser() user: ContextUser,
  ) {
    return this.dayPlanItemService.create(createDayPlanItemDto, user);
  }

  @ApiOperation({ summary: 'Get all day plan items' })
  @Get()
  findAll() {
    return this.dayPlanItemService.findAll();
  }

  @ApiOperation({ summary: 'Get a day plan item by id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dayPlanItemService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a day plan item' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateDayPlanItemDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDayPlanItemDto: UpdateDayPlanItemDto,
  ) {
    return this.dayPlanItemService.update(+id, updateDayPlanItemDto);
  }

  @ApiOperation({ summary: 'Delete a day plan item' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dayPlanItemService.remove(+id);
  }
}
