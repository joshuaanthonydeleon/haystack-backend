import { Migration } from '@mikro-orm/migrations';

export class Migration20250919043909 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "institution_name" varchar(255) null, add column "title" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "institution_name", drop column "title";`);
  }

}
