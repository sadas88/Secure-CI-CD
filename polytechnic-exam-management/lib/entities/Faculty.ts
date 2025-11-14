import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faculty')
export class Faculty {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  facultyId!: string; // Unique faculty ID

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  department!: string;

  @Column({ nullable: true })
  designation?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
