import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommutesService } from './commutes.service';
import { Station, CommuteCandidate } from '../../database/entities';

describe('CommutesService', () => {
  let service: CommutesService;
  let stationRepository: Repository<Station>;
  let commuteCandidateRepository: Repository<CommuteCandidate>;

  const mockStation: Station = {
    id: 'station-uuid',
    nameJa: '渋谷',
    lineCode: 'JY20',
    lineNameJa: '山手線',
    latitude: 35.6598,
    longitude: 139.7006,
    originCommutes: [],
    candidateCommutes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCandidateStation: Station = {
    id: 'candidate-uuid',
    nameJa: '恵比寿',
    lineCode: 'JY21',
    lineNameJa: '山手線',
    latitude: 35.6467,
    longitude: 139.7108,
    originCommutes: [],
    candidateCommutes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommuteCandidate: CommuteCandidate = {
    id: 'commute-uuid',
    originStation: mockStation,
    originStationId: 'station-uuid',
    candidateStation: mockCandidateStation,
    candidateStationId: 'candidate-uuid',
    minutes: 4,
    suumoUrl: 'https://suumo.jp/test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommutesService,
        {
          provide: getRepositoryToken(Station),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CommuteCandidate),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommutesService>(CommutesService);
    stationRepository = module.get<Repository<Station>>(
      getRepositoryToken(Station),
    );
    commuteCandidateRepository = module.get<Repository<CommuteCandidate>>(
      getRepositoryToken(CommuteCandidate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchCommuteCandidates', () => {
    it('should return commute candidates for valid station', async () => {
      // Arrange
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCommuteCandidate]),
      };

      jest.spyOn(stationRepository, 'findOne').mockResolvedValue(mockStation);
      jest
        .spyOn(commuteCandidateRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.searchCommuteCandidates('渋谷');

      // Assert
      expect(result).toEqual([
        {
          station: '恵比寿',
          line: '山手線',
          minutes: 4,
          suumo_url: 'https://suumo.jp/test',
        },
      ]);
      expect(stationRepository.findOne).toHaveBeenCalledWith({
        where: { nameJa: '渋谷' },
      });
    });

    it('should throw NotFoundException for invalid station', async () => {
      // Arrange
      jest.spyOn(stationRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.searchCommuteCandidates('無効駅')).rejects.toThrow(
        new NotFoundException('駅「無効駅」が見つかりません'),
      );
    });
  });

  describe('seedSampleData', () => {
    it('should not seed data if stations already exist', async () => {
      // Arrange
      jest.spyOn(stationRepository, 'count').mockResolvedValue(5);

      // Act
      await service.seedSampleData();

      // Assert
      expect(stationRepository.save).not.toHaveBeenCalled();
    });

    it('should seed sample data if no stations exist', async () => {
      // Arrange
      const mockSavedStations = [
        { ...mockStation, nameJa: '渋谷' },
        { ...mockCandidateStation, nameJa: '恵比寿' },
        { ...mockStation, id: 'meguro-uuid', nameJa: '目黒' },
        { ...mockStation, id: 'shinagawa-uuid', nameJa: '品川' },
      ];

      jest.spyOn(stationRepository, 'count').mockResolvedValue(0);
      jest
        .spyOn(stationRepository, 'save')
        .mockResolvedValue(mockSavedStations as any);
      jest
        .spyOn(commuteCandidateRepository, 'save')
        .mockResolvedValue([] as any);

      // Act
      await service.seedSampleData();

      // Assert
      expect(stationRepository.save).toHaveBeenCalled();
      expect(commuteCandidateRepository.save).toHaveBeenCalled();
    });
  });
});
