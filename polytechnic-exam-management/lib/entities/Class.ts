import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from './Branch';
import { Semester } from './Semester';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column()
  branchId!: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semesterId' })
  semester!: Semester;

  @Column()
  semesterId!: number;

  @Column()
  section!: string; // e.g., "A", "B", "C"

  @Column({ unique: true })
  className!: string; // Generated: branchCode + semester + section (e.g., "CS3A")

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
