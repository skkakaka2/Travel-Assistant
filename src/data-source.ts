import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/entities/user.entity';
import { Trip } from './trip/entities/trip.entity';
import { DayPlan } from './day-plan/entities/day-plan.entity';
import { DayPlanItem } from './day-plan/entities/day-plan-item.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: [User, Trip, DayPlan, DayPlanItem],
  migrations: ['src/migrations/*.ts', 'dist/migrations/*.js'],
  synchronize: false, // Always false when using migrations
  logging: process.env.NODE_ENV === 'development',
});

