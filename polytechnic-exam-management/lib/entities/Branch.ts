import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  branchCode!: string; // e.g., "CS", "ME", "CE"

  @Column()
  branchName!: string; // e.g., "Computer Science", "Mechanical Engineering"

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
