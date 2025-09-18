import { Migration } from '@mikro-orm/migrations';

export class Migration20250918042113 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "rating" ("id" serial primary key, "vendor_id" int not null, "user_id" int not null, "rating" int not null, "is_verified" boolean not null default false, "is_anonymous" boolean not null default false, "tags" jsonb null, "reviewer" text null, "reviewer_title" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`create index "rating_vendor_id_user_id_index" on "rating" ("vendor_id", "user_id");`);

    this.addSql(`alter table "rating" add constraint "rating_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "rating" add constraint "rating_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "user" drop constraint if exists "user_role_check";`);

    this.addSql(`alter table "vendor_profile" add column "subcategories" jsonb null, add column "location" text null, add column "size" text check ("size" in ('startup', 'small', 'midMarket', 'enterprise')) null, add column "founded" text null, add column "employees" text null, add column "rating" numeric(2,1) null, add column "compatibility" int null, add column "description" text null, add column "long_description" text null, add column "website" text null, add column "phone" text null, add column "email" text null, add column "logo_url" text null, add column "tags" jsonb null, add column "features" jsonb null, add column "integrations" jsonb null, add column "certifications" jsonb null, add column "client_size" jsonb null, add column "pricing_model" text check ("pricing_model" in ('subscription', 'one-time', 'usage-based', 'freemium')) null, add column "price_range" text null, add column "status" text check ("status" in ('active', 'pending', 'inactive', 'suspended')) not null default 'pending', add column "verification_status" text check ("verification_status" in ('verified', 'pending', 'rejected')) not null default 'pending', add column "last_activity_at" timestamptz null;`);

    this.addSql(`alter table "vendor" add column "claimed_at" timestamptz null;`);

    this.addSql(`alter table "user" add constraint "user_role_check" check("role" in ('admin', 'vendor', 'bank'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "rating" cascade;`);

    this.addSql(`alter table "user" drop constraint if exists "user_role_check";`);

    this.addSql(`alter table "vendor_profile" drop column "subcategories", drop column "location", drop column "size", drop column "founded", drop column "employees", drop column "rating", drop column "compatibility", drop column "description", drop column "long_description", drop column "website", drop column "phone", drop column "email", drop column "logo_url", drop column "tags", drop column "features", drop column "integrations", drop column "certifications", drop column "client_size", drop column "pricing_model", drop column "price_range", drop column "status", drop column "verification_status", drop column "last_activity_at";`);

    this.addSql(`alter table "vendor" drop column "claimed_at";`);

    this.addSql(`alter table "user" add constraint "user_role_check" check("role" in ('admin', 'vendor'));`);
  }

}
