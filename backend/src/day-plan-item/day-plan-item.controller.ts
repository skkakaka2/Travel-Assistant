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

@Controller('day-plan-item')
export class DayPlanItemController {
  constructor(private readonly dayPlanItemService: DayPlanItemService) {}

  @Post()
  create(
    @Body() createDayPlanItemDto: CreateDayPlanItemDto,
    @ContextUser() user: ContextUser,
  ) {
    return this.dayPlanItemService.create(createDayPlanItemDto, user);
  }

  @Get()
  findAll() {
    return this.dayPlanItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dayPlanItemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDayPlanItemDto: UpdateDayPlanItemDto,
  ) {
    return this.dayPlanItemService.update(+id, updateDayPlanItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dayPlanItemService.remove(+id);
  }
}
