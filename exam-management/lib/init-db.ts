import { getDataSource } from './database';
import { User, UserRole } from './entities/User';

export async function initializeDatabase() {
  const dataSource = await getDataSource();

  // Create default admin user if it doesn't exist
  const userRepository = dataSource.getRepository(User);
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@polytechnic.edu' },
  });

  if (!adminExists) {
    const admin = userRepository.create({
      email: 'admin@polytechnic.edu',
      password: 'Admin@123', // Should be changed on first login
      name: 'System Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('Default admin user created: admin@polytechnic.edu / Admin@123');
  }

  console.log('Database initialized successfully');
}
