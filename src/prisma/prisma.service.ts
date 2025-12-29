import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/index';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      // eslint-disable-next-line no-console
      console.warn(
        '[PrismaService] DATABASE_URL is not defined, using default MariaDB adapter config.',
      );
      super({ adapter: new PrismaMariaDb({}) });
      return;
    }

    const url = new URL(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace(/^\//, ''),
    });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
