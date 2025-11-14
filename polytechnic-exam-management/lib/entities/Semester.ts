import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('semesters')
export class Semester {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  semesterNumber!: number; // 1-6 for diploma

  @Column()
  academicYear!: string; // e.g., "2024-25"

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
