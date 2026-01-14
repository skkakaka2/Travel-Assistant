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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TripService } from './trip.service';
import { TripExportService } from './trip-export.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';
import { PaginationQuery } from 'src/common/pagination';

@ApiTags('Trip Management')
@ApiBearerAuth()
@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripExportService: TripExportService,
  ) {}

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

  @Get(':id/export/image')
  @ApiOperation({ summary: 'Export trip as image (PNG)' })
  @ApiParam({
    name: 'id',
    description: 'Trip ID',
    example: 1,
    type: Number,
  })
  async exportToImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() reply: FastifyReply,
  ) {
    try {
      // 先获取行程信息以获取名称
      const trip = await this.tripExportService.getTripWithDetails(id);
      const imageBuffer = await this.tripExportService.exportToImage(id);
      const tripName = trip.name || 'trip';

      reply
        .type('image/png')
        .header(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(tripName)}.png"`,
        )
        .send(imageBuffer);
    } catch (error: any) {
      reply.status(500).send({
        code: 500,
        message: error.message || '导出图片失败',
        data: null,
      });
    }
  }
}
