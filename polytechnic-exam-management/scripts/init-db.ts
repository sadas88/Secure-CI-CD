import 'reflect-metadata';
import { getDataSource } from '../lib/database';
import { User, UserRole } from '../lib/entities/User';
import { hashPassword } from '../lib/auth';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    const dataSource = await getDataSource();
    
    console.log('Database initialized successfully');

    // Create default admin user
    const userRepository = dataSource.getRepository(User);
    const adminExists = await userRepository.findOne({ where: { email: 'admin@polytechnic.edu' } });

    if (!adminExists) {
      const hashedPassword = await hashPassword('Admin@123');
      const admin = userRepository.create({
        email: 'admin@polytechnic.edu',
        password: hashedPassword,
        name: 'System Administrator',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);
      console.log('Default admin user created:');
      console.log('Email: admin@polytechnic.edu');
      console.log('Password: Admin@123');
      console.log('Please change the password after first login!');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
