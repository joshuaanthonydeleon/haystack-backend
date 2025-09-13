import { Migration } from '@mikro-orm/migrations';

export class Migration20250910150402 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "first_name" varchar(255) not null, add column "last_name" varchar(255) not null, add column "phone" varchar(255) not null, add column "address" varchar(255) not null, add column "city" varchar(255) not null, add column "state" varchar(255) not null, add column "zip" varchar(255) not null, add column "country" varchar(255) not null, add column "website" varchar(255) not null, add column "linkedin_profile" varchar(255) not null, add column "facebook_profile" varchar(255) not null, add column "twitter_profile" varchar(255) not null, add column "instagram_profile" varchar(255) not null, add column "youtube_profile" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "first_name", drop column "last_name", drop column "phone", drop column "address", drop column "city", drop column "state", drop column "zip", drop column "country", drop column "website", drop column "linkedin_profile", drop column "facebook_profile", drop column "twitter_profile", drop column "instagram_profile", drop column "youtube_profile";`);
  }

}
