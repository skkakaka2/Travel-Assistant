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
import { DayPlan } from './day-plan.entity';

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
  dayPlanId: number;

  @Column({ type: 'enum', enum: PlanItemType })
  type: PlanItemType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  startTime?: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  endTime?: Date | null;

  @Column({ type: 'int', nullable: true })
  duration?: number | null;

  @Column({ type: 'int', default: 0, nullable: true })
  cost?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

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

  @ManyToOne(() => DayPlan, (dayPlan) => dayPlan.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dayPlanId' })
  dayPlan: DayPlan;
}

