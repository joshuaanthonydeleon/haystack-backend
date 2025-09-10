import { Migration } from '@mikro-orm/migrations';

export class Migration20250910051922_initial extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "password_hash" varchar(255) not null, "role" text check ("role" in ('admin', 'vendor')) not null, "is_email_verified" boolean not null default false, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "token" ("id" serial primary key, "token" varchar(255) not null, "type" text check ("type" in ('refresh', 'password_reset', 'email_verification')) not null, "expires_at" timestamptz not null, "is_used" boolean not null default false, "user_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "token" add constraint "token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "token" drop constraint "token_user_id_foreign";`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "token" cascade;`);
  }

}
