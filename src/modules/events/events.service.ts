import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventType } from '../../database/entities';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Event> {
    const event = this.eventRepository.create({
      eventType: createEventDto.type,
      payload: createEventDto.payload,
      sessionId: createEventDto.sessionId,
      userId: createEventDto.userId,
      ipAddress,
      userAgent,
    });

    return this.eventRepository.save(event);
  }

  // 取得事件統計（用於未來 B2B 數據產品）
  async getEventStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.eventType');

    if (startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate });
    }

    return query.getRawMany();
  }

  // 取得熱門搜尋駅（從 INPUT 事件統計）
  async getPopularStations(limit: number = 10): Promise<any> {
    return this.eventRepository
      .createQueryBuilder('event')
      .select("event.payload->>'station'", 'station')
      .addSelect('COUNT(*)', 'searchCount')
      .where('event.eventType = :type', { type: EventType.INPUT })
      .andWhere("event.payload->>'station' IS NOT NULL")
      .groupBy("event.payload->>'station'")
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
