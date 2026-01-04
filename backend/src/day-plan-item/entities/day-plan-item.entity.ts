import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DayPlan } from '../../day-plan/entities/day-plan.entity';
import { Trip } from 'src/trip/entities/trip.entity';

export enum PlanItemType {
  HOTEL = 'HOTEL',
  ATTRACTION = 'ATTRACTION',
  RESTAURANT = 'RESTAURANT',
  TRANSPORT = 'TRANSPORT',
  ACTIVITY = 'ACTIVITY',
  OTHER = 'OTHER',
}

@Entity('day_plan_items')
@Index('day_plan_items_dayPlanId_idx', ['dayPlanId'])
@Index('day_plan_items_type_idx', ['type'])
export class DayPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @ManyToOne(() => DayPlan, (dayPlan) => dayPlan.id, { onDelete: 'CASCADE' })
  dayPlanId: number;

  @Column({ type: 'int' })
  @ManyToOne(() => Trip, (trip) => trip.id, { onDelete: 'CASCADE' })
  tripId: number;

  @Column({ type: 'enum', enum: PlanItemType })
  type: PlanItemType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  startTime?: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  endTime?: string | null;

  @Column({ type: 'int', nullable: true })
  duration?: number | null;

  @Column({ type: 'int', default: 0, nullable: true })
  cost?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number | null;

  @Column({ type: 'int', nullable: true })
  distance?: number | null;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt: Date;
}
