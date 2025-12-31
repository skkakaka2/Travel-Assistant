import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'], // Only scan source files for CLI
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
