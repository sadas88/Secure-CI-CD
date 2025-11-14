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
import { Student } from './Student';
import { Subject } from './Subject';

@Entity('attendances')
@Unique(['studentId', 'subjectId', 'month', 'year'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  studentId!: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column()
  subjectId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column({ type: 'int' })
  month!: number; // 1-12

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  totalClasses!: number;

  @Column({ type: 'int' })
  attendedClasses!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  createdBy!: number | null; // Faculty ID who entered this
}
