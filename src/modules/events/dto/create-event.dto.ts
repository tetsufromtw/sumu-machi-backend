import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../../database/entities';

export class CreateEventDto {
  @ApiProperty({
    description: 'イベントタイプ',
    enum: EventType,
    example: EventType.INPUT,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'イベント関連データ',
    example: { station: '渋谷', searchTime: new Date() },
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({
    description: 'セッションID',
    example: 'session-123-456',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'ユーザーID',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class EventResponseDto {
  @ApiProperty({ description: 'ステータス', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'イベントID', example: 'uuid-string' })
  eventId: string;
}
