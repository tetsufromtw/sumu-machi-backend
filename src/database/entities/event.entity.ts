import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  INPUT = 'input', // 輸入勤務地駅
  VIEW = 'view', // 檢視候補駅
  CLICK = 'click', // 點擊外連（SUUMO）
  DETAIL = 'detail', // 詳しく見る
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>; // 事件相關資料

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId?: string; // 追蹤使用者 session

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string; // 使用者 IP

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string; // 瀏覽器資訊

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
