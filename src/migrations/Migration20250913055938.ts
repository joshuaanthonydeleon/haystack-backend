import { Migration } from '@mikro-orm/migrations';

export class Migration20250913055938 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "vendor" alter column "website" type varchar(255) using ("website"::varchar(255));`);
    this.addSql(`alter table "vendor" alter column "website" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "vendor" alter column "website" type varchar(255) using ("website"::varchar(255));`);
    this.addSql(`alter table "vendor" alter column "website" set not null;`);
  }

}
