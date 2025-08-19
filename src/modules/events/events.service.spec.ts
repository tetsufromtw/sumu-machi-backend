import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event, EventType } from '../../database/entities';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: Repository<Event>;

  const mockEvent: Event = {
    id: 'event-uuid',
    eventType: EventType.INPUT,
    payload: { station: '渋谷' },
    sessionId: 'session-123',
    userId: null,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    user: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create and save an event', async () => {
      // Arrange
      const createEventDto: CreateEventDto = {
        type: EventType.INPUT,
        payload: { station: '渋谷' },
        sessionId: 'session-123',
      };

      jest.spyOn(eventRepository, 'create').mockReturnValue(mockEvent);
      jest.spyOn(eventRepository, 'save').mockResolvedValue(mockEvent);

      // Act
      const result = await service.createEvent(
        createEventDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );

      // Assert
      expect(eventRepository.create).toHaveBeenCalledWith({
        eventType: EventType.INPUT,
        payload: { station: '渋谷' },
        sessionId: 'session-123',
        userId: undefined,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(eventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('getEventStatistics', () => {
    it('should return event statistics', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'input', count: '5' },
          { type: 'view', count: '3' },
        ]),
      };

      jest
        .spyOn(eventRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getEventStatistics();

      // Assert
      expect(eventRepository.createQueryBuilder).toHaveBeenCalledWith('event');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual([
        { type: 'input', count: '5' },
        { type: 'view', count: '3' },
      ]);
    });
  });

  describe('getPopularStations', () => {
    it('should return popular stations', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { station: '渋谷', searchCount: '10' },
          { station: '新宿', searchCount: '8' },
        ]),
      };

      jest
        .spyOn(eventRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getPopularStations(5);

      // Assert
      expect(eventRepository.createQueryBuilder).toHaveBeenCalledWith('event');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual([
        { station: '渋谷', searchCount: '10' },
        { station: '新宿', searchCount: '8' },
      ]);
    });
  });
});
