import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  scheme!: string;

  @Column({ unique: true })
  subjectCode!: string;

  @Column()
  subjectName!: string;

  @Column()
  teachingDepartment!: string;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  credits!: number;

  @Column({ type: 'int' })
  maxCIE!: number;

  @Column({ type: 'int' })
  maxSEE!: number;

  @Column({ type: 'int' })
  totalMarks!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
