import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Class } from './Class';
import { Subject } from './Subject';

@Entity('class_subject_mappings')
@Unique(['classId', 'subjectId'])
export class ClassSubjectMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  classId!: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @Column()
  subjectId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @CreateDateColumn()
  createdAt!: Date;
}
