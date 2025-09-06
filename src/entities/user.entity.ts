import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

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

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}