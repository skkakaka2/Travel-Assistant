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
  Query,
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
import { PaginationQuery } from 'src/common/pagination';

@ApiTags('Trip Management')
@ApiBearerAuth()
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiOperation({ summary: 'Create a trip' })
  @ApiBody({ type: CreateTripDto })
  create(
    @Body() createTripDto: CreateTripDto,
    @ContextUser() user: ContextUser,
  ) {
    return this.tripService.create(createTripDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips' })
  findAll(@Query() paginationQuery: PaginationQuery) {
    return this.tripService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trip by id' })
  @ApiParam({
    name: 'id',
    description: 'Trip ID',
    example: 1,
    type: Number,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tripService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trip' })
  @ApiParam({
    name: 'id',
    description: 'Trip ID',
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
  @ApiOperation({ summary: 'Delete a trip' })
  @ApiParam({
    name: 'id',
    description: 'Trip ID',
    example: 1,
    type: Number,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tripService.remove(id);
  }
}
