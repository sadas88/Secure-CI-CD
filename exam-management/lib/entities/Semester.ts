import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('semesters')
export class Semester {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  semesterNumber!: number;

  @Column()
  academicYear!: string; // e.g., "2024-25"

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
