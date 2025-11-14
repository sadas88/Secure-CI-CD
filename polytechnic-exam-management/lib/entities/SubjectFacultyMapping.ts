import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Subject } from './Subject';
import { Faculty } from './Faculty';

@Entity('subject_faculty_mappings')
export class SubjectFacultyMapping {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @CreateDateColumn()
  createdAt!: Date;
}
