import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trip } from 'src/trip/entities/trip.entity';

@Entity('user')
@Index('User_email_key', ['email'], { unique: true })
@Index('User_username_key', ['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191, unique: true })
  email: string;

  @Column({ length: 191, unique: true })
  username: string;

  @Column({ length: 191 })
  password: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  avatar?: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  homeAddress?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  homeLatitude?: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  homeLongitude?: number | null;

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

  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];
}
