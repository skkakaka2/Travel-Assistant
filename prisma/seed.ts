import { PrismaClient } from '@prisma/client/index';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}
const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log('🌱 Starting seed...');

  const admin = await prisma.user.findFirst({
    where: {
      username: 'admin',
    },
  });
  if (admin) {
    console.log('Admin user already exists');
    return;
  }
  const passwordadmin = await bcrypt.hash('admin', 10);
  // 创建示例用户
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: passwordadmin,
      name: 'Admin User',
    },
  });

  console.log('✅ Seed completed!');
  console.log('Created users:', { user1 });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
