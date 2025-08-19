import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommuteCandidate } from './commute-candidate.entity';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_ja', type: 'varchar', length: 100 })
  nameJa: string; // 日文站名

  @Column({ name: 'line_code', type: 'varchar', length: 20 })
  lineCode: string; // 路線代號

  @Column({ name: 'line_name_ja', type: 'varchar', length: 100 })
  lineNameJa: string; // 路線名稱（日文）

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude?: number; // 緯度

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude?: number; // 經度

  @OneToMany(() => CommuteCandidate, (candidate) => candidate.originStation)
  originCommutes: CommuteCandidate[];

  @OneToMany(() => CommuteCandidate, (candidate) => candidate.candidateStation)
  candidateCommutes: CommuteCandidate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
