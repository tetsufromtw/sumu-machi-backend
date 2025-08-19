import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto } from './dto/create-event.dto';

@ApiTags('イベント追跡')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'イベント記録',
    description: 'ユーザーの行動イベント（検索、閲覧、クリック等）を記録します',
  })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 200,
    description: 'イベント記録成功',
    type: EventResponseDto,
  })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() request: Request,
  ): Promise<EventResponseDto> {
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');

    const event = await this.eventsService.createEvent(
      createEventDto,
      ipAddress,
      userAgent,
    );

    return {
      status: 'ok',
      eventId: event.id,
    };
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'イベント統計取得',
    description: 'イベントタイプ別の統計データを取得します（B2Bデータ商品用）',
  })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({
    status: 200,
    description: '統計データ取得成功',
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.eventsService.getEventStatistics(start, end);
  }

  @Get('popular-stations')
  @ApiOperation({
    summary: '人気駅ランキング',
    description: '検索回数の多い駅のランキングを取得します',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: '人気駅ランキング取得成功',
  })
  async getPopularStations(@Query('limit') limit?: number): Promise<any[]> {
    return this.eventsService.getPopularStations(
      limit ? parseInt(limit.toString()) : 10,
    );
  }
}
