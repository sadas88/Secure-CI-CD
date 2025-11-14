import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from './Class';
import { Subject } from './Subject';

@Entity('class_subject_mappings')
export class ClassSubjectMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class!: Class;

  @Column()
  classId!: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column()
  subjectId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
