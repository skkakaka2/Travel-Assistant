import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

/**
 * Ensure the default admin account exists.
 */
export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (existing) {
    console.log('✅ Admin user already exists');
    return;
  }

  const hashed = await bcrypt.hash('admin', 10);

  const admin = userRepository.create({
    username: 'admin',
    email: 'admin@example.com',
    password: hashed,
    name: 'Administrator',
  });

  await userRepository.save(admin);
  console.log(
    '✅ Seeded default admin user (username: admin, password: admin)',
  );
}
