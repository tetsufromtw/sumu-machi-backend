import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Station } from './station.entity';

@Entity('commute_candidates')
export class CommuteCandidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Station, (station) => station.originCommutes)
  @JoinColumn({ name: 'origin_station_id' })
  originStation: Station;

  @Column({ name: 'origin_station_id', type: 'uuid' })
  originStationId: string;

  @ManyToOne(() => Station, (station) => station.candidateCommutes)
  @JoinColumn({ name: 'candidate_station_id' })
  candidateStation: Station;

  @Column({ name: 'candidate_station_id', type: 'uuid' })
  candidateStationId: string;

  @Column({ type: 'int' })
  minutes: number; // 通勤時間（分鐘）

  @Column({ name: 'suumo_url', type: 'text', nullable: true })
  suumoUrl?: string; // SUUMO 連結

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
