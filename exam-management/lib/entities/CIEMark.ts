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

@Entity('cie_marks')
@Unique(['studentId', 'subjectId'])
export class CIEMark {
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
  cieMarks!: number;

  @Column({ type: 'int', nullable: true })
  seeMarks!: number | null;

  @Column({ type: 'int', nullable: true })
  totalMarks!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  createdBy!: number | null; // Faculty ID who entered this
}
