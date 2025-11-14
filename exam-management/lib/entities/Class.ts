import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Branch } from './Branch';
import { Semester } from './Semester';

@Entity('classes')
@Unique(['branchId', 'semesterId', 'section'])
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  branchId!: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column()
  semesterId!: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semesterId' })
  semester!: Semester;

  @Column()
  section!: string; // e.g., "A", "B", "C"

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
