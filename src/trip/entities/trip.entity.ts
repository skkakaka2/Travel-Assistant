import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { DayPlan } from 'src/day-plan/entities/day-plan.entity';

@Entity('trips')
@Index('trips_userId_idx', ['userId'])
@Index('trips_startDate_idx', ['startDate'])
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int', default: 0 })
  userCount: number;

  @Column({ type: 'int', default: 0 })
  budget: number;

  @Column({ type: 'varchar', length: 191 })
  startDate: string;

  @Column({ type: 'varchar', length: 191 })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

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

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => DayPlan, (dayPlan) => dayPlan.trip)
  dayPlans: DayPlan[];
}