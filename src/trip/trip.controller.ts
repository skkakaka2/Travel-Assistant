import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import type { FastifyRequest } from 'fastify';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';

@ApiTags('行程管理')
@ApiBearerAuth()
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiOperation({ summary: '创建行程' })
  @ApiBody({ type: CreateTripDto })
  create(
    @Body() createTripDto: CreateTripDto,
    @ContextUser() user: ContextUser,
  ) {
    return this.tripService.create(createTripDto, user);
  }

  @Get()
  @ApiOperation({ summary: '获取所有行程' })
  findAll() {
    return this.tripService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个行程详情' })
  @ApiParam({
    name: 'id',
    description: '行程 ID',
    example: 1,
    type: Number,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新行程' })
  @ApiParam({
    name: 'id',
    description: '行程 ID',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateTripDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除行程' })
  @ApiParam({
    name: 'id',
    description: '行程 ID',
    example: 1,
    type: Number,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripService.remove(id);
  }
}
