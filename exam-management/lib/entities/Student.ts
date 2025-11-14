import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from './Class';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  usn!: string; // University Seat Number

  @Column()
  name!: string;

  @Column({ nullable: true })
  email!: string | null;

  @Column({ nullable: true })
  phone!: string | null;

  @Column()
  classId!: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
