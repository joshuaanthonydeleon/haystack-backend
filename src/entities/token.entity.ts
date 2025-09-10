import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from './user.entity';

export enum TokenType {
  REFRESH = 'refresh',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity()
export class Token {
  @PrimaryKey()
  id!: number;

  @Property()
  token!: string;

  @Enum(() => TokenType)
  type!: TokenType;

  @Property()
  expiresAt!: Date;

  @Property({ default: false })
  isUsed!: boolean;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
