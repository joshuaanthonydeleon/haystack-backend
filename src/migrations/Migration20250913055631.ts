import { Migration } from '@mikro-orm/migrations';

export class Migration20250913055631 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" alter column "website" type varchar(255) using ("website"::varchar(255));`);
    this.addSql(`alter table "user" alter column "website" drop not null;`);
    this.addSql(`alter table "user" alter column "linkedin_profile" type varchar(255) using ("linkedin_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "linkedin_profile" drop not null;`);
    this.addSql(`alter table "user" alter column "facebook_profile" type varchar(255) using ("facebook_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "facebook_profile" drop not null;`);
    this.addSql(`alter table "user" alter column "twitter_profile" type varchar(255) using ("twitter_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "twitter_profile" drop not null;`);
    this.addSql(`alter table "user" alter column "instagram_profile" type varchar(255) using ("instagram_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "instagram_profile" drop not null;`);
    this.addSql(`alter table "user" alter column "youtube_profile" type varchar(255) using ("youtube_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "youtube_profile" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" alter column "website" type varchar(255) using ("website"::varchar(255));`);
    this.addSql(`alter table "user" alter column "website" set not null;`);
    this.addSql(`alter table "user" alter column "linkedin_profile" type varchar(255) using ("linkedin_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "linkedin_profile" set not null;`);
    this.addSql(`alter table "user" alter column "facebook_profile" type varchar(255) using ("facebook_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "facebook_profile" set not null;`);
    this.addSql(`alter table "user" alter column "twitter_profile" type varchar(255) using ("twitter_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "twitter_profile" set not null;`);
    this.addSql(`alter table "user" alter column "instagram_profile" type varchar(255) using ("instagram_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "instagram_profile" set not null;`);
    this.addSql(`alter table "user" alter column "youtube_profile" type varchar(255) using ("youtube_profile"::varchar(255));`);
    this.addSql(`alter table "user" alter column "youtube_profile" set not null;`);
  }

}
