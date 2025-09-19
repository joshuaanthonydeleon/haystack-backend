import { Migration } from '@mikro-orm/migrations';

export class Migration20250918050906 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "vendor_profile" drop column "description", drop column "long_description", drop column "website";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "vendor_profile" add column "description" text null, add column "long_description" text null, add column "website" text null;`);
  }

}
