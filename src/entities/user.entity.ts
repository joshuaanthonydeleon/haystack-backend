import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Token } from './token.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Token, token => token.user)
  tokens!: Token[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}