import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  HOD = 'hod',
  FACULTY = 'faculty',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // Hashed password

  @Column()
  name!: string;

  @Column({
    type: 'text',
    enum: UserRole,
    default: UserRole.FACULTY,
  })
  role!: UserRole;

  @Column({ nullable: true })
  departmentId?: number; // For HoD and Faculty

  @Column({ default: false })
  isActive!: boolean;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts!: number;

  @Column({ nullable: true })
  passwordChangedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
