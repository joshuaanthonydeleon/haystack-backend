import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum TokenType {
  REFRESH = 'refresh',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  token!: string;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type!: TokenType;

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  isUsed!: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
