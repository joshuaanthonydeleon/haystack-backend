import { Migration } from '@mikro-orm/migrations';

export class Migration20250913051350 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "vendor_profile" ("id" serial primary key, "summary" text null, "detailed_description" text null, "category" text check ("category" in ('Core, Lending & Digital Banking', 'Core & Digital Banking', 'Core, Payments & Risk', 'Core Banking', 'Core, Payments & Digital', 'Digital Banking Platform', 'Payments', 'Lending', 'Risk & Compliance', 'Analytics', 'Fintech', 'Other')) null, "target_customers" jsonb null, "search_hints_keywords" jsonb null, "compliance_certifications" jsonb null, "integrations_core_support" jsonb null, "digital_banking_partners" jsonb null, "notable_customers" jsonb null, "pricing_notes" text null, "source_url" text null, "confidence" numeric(3,2) null, "last_verified" timestamptz null, "notes" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "vendor" ("id" serial primary key, "company_name" varchar(255) not null, "website" varchar(255) not null, "is_active" boolean not null default true, "profile_id" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "vendor" add constraint "vendor_company_name_unique" unique ("company_name");`);
    this.addSql(`alter table "vendor" add constraint "vendor_website_unique" unique ("website");`);
    this.addSql(`alter table "vendor" add constraint "vendor_profile_id_unique" unique ("profile_id");`);

    this.addSql(`alter table "vendor" add constraint "vendor_profile_id_foreign" foreign key ("profile_id") references "vendor_profile" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "user" add column "vendor_id" int null;`);
    this.addSql(`alter table "user" add constraint "user_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "vendor" drop constraint "vendor_profile_id_foreign";`);

    this.addSql(`alter table "user" drop constraint "user_vendor_id_foreign";`);

    this.addSql(`drop table if exists "vendor_profile" cascade;`);

    this.addSql(`drop table if exists "vendor" cascade;`);

    this.addSql(`alter table "user" drop column "vendor_id";`);
  }

}
