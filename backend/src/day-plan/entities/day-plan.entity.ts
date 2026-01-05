import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { DayPlanItem } from '../../day-plan-item/entities/day-plan-item.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('day_plans')
@Index('day_plans_tripId_idx', ['tripId'])
@Index('day_plans_date_idx', ['date'])
@Unique('day_plans_tripId_date_key', ['tripId', 'date'])
export class DayPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 191 })
  date: string;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'int', default: 0 })
  distance?: number;

  @Column({ type: 'int', default: 0 })
  duration?: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

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

  @ManyToOne(() => Trip, (trip) => trip.dayPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column({ type: 'int' })
  tripId: number;

  @OneToMany(() => DayPlanItem, (dayPlanItem) => dayPlanItem.dayPlan)
  dayPlanItems: DayPlanItem[];
}
