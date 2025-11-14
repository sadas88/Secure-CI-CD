import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './Student';
import { Subject } from './Subject';
import { Faculty } from './Faculty';

@Entity('cie_marks')
export class CIEMarks {
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

  @Column({ type: 'int' })
  marksObtained!: number;

  @Column({ type: 'int' })
  maxMarks!: number; // Should match subject.maxCIE

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
