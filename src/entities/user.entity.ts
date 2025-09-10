import { Entity, PrimaryKey, Property, OneToMany, Enum } from '@mikro-orm/core';
import { Token } from './token.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
}

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Enum(() => UserRole)
  role!: UserRole;

  @Property({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Token, token => token.user)
  tokens?: Token[] = [];

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}