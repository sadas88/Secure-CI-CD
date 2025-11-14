import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './Student';
import { Subject } from './Subject';
import { Faculty } from './Faculty';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column()
  studentId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column()
  subjectId!: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'facultyId' })
  faculty!: Faculty;

  @Column()
  facultyId!: number;

  @Column()
  month!: number; // 1-12

  @Column()
  year!: number;

  @Column({ type: 'int' })
  totalClasses!: number;

  @Column({ type: 'int' })
  attendedClasses!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage?: number; // Calculated: (attendedClasses / totalClasses) * 100

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
