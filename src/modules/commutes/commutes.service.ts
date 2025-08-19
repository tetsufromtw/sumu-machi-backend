import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station, CommuteCandidate } from '../../database/entities';
import { CommuteResultDto } from './dto/search-commute.dto';

@Injectable()
export class CommutesService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(CommuteCandidate)
    private commuteCandidateRepository: Repository<CommuteCandidate>,
  ) {}

  async searchCommuteCandidates(origin: string): Promise<CommuteResultDto[]> {
    // 尋找起始車站
    const originStation = await this.stationRepository.findOne({
      where: { nameJa: origin },
    });

    if (!originStation) {
      throw new NotFoundException(`駅「${origin}」が見つかりません`);
    }

    // 尋找 30 分鐘內的通勤候補
    const candidates = await this.commuteCandidateRepository
      .createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.candidateStation', 'station')
      .where('candidate.originStationId = :originId', {
        originId: originStation.id,
      })
      .andWhere('candidate.minutes <= :maxMinutes', { maxMinutes: 30 })
      .orderBy('candidate.minutes', 'ASC')
      .getMany();

    // 轉換為回應格式，依路線分組
    return candidates.map((candidate) => ({
      station: candidate.candidateStation.nameJa,
      line: candidate.candidateStation.lineNameJa,
      minutes: candidate.minutes,
      suumo_url:
        candidate.suumoUrl ||
        this.generateSuumoUrl(candidate.candidateStation.nameJa),
    }));
  }

  // 產生 SUUMO URL（暫時使用模擬邏輯）
  private generateSuumoUrl(stationName: string): string {
    const baseUrl = 'https://suumo.jp/chintai/tokyo/ek_';
    const encodedStation = encodeURIComponent(stationName);
    return `${baseUrl}${encodedStation}/`;
  }

  // 為測試目的提供範例資料的方法
  async seedSampleData(): Promise<void> {
    // 檢查是否已有資料
    const existingStations = await this.stationRepository.count();
    if (existingStations > 0) {
      return; // 已有資料，不重複新增
    }

    // 新增範例車站
    const stations = [
      { nameJa: '渋谷', lineCode: 'JY20', lineNameJa: '山手線' },
      { nameJa: '恵比寿', lineCode: 'JY21', lineNameJa: '山手線' },
      { nameJa: '目黒', lineCode: 'JY22', lineNameJa: '山手線' },
      { nameJa: '品川', lineCode: 'JY25', lineNameJa: '山手線' },
    ];

    const savedStations = await this.stationRepository.save(stations);
    const shibuyaStation = savedStations.find((s) => s.nameJa === '渋谷');
    const ebisuStation = savedStations.find((s) => s.nameJa === '恵比寿');
    const meguroStation = savedStations.find((s) => s.nameJa === '目黒');
    const shinagawaStation = savedStations.find((s) => s.nameJa === '品川');

    if (
      !shibuyaStation ||
      !ebisuStation ||
      !meguroStation ||
      !shinagawaStation
    ) {
      throw new Error('範例車站建立失敗');
    }

    // 新增通勤候補關係
    const commuteCandidates = [
      {
        originStationId: shibuyaStation.id,
        candidateStationId: ebisuStation.id,
        minutes: 4,
      },
      {
        originStationId: shibuyaStation.id,
        candidateStationId: meguroStation.id,
        minutes: 7,
      },
      {
        originStationId: shibuyaStation.id,
        candidateStationId: shinagawaStation.id,
        minutes: 12,
      },
    ];

    await this.commuteCandidateRepository.save(commuteCandidates);
  }
}
