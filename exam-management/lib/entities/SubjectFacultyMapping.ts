import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Subject } from './Subject';
import { Faculty } from './Faculty';

@Entity('subject_faculty_mappings')
@Unique(['subjectId', 'facultyId'])
export class SubjectFacultyMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  subjectId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column()
  facultyId!: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'facultyId' })
  faculty!: Faculty;

  @CreateDateColumn()
  createdAt!: Date;
}
