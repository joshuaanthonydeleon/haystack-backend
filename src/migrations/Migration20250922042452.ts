import { Migration } from '@mikro-orm/migrations';

export class Migration20250922042452 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "vendor_research" ("id" serial primary key, "vendor_id" int not null, "status" text check ("status" in ('pending', 'in_progress', 'completed', 'failed')) not null default 'pending', "website_url" text null, "website_snapshot" jsonb null, "extracted_profile" jsonb null, "discovered_logo_url" text null, "deep_research_insights" jsonb null, "raw_research_artifacts" jsonb null, "error_message" text null, "llm_model" text null, "metadata" jsonb null, "requested_at" timestamptz not null, "started_at" timestamptz null, "completed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`alter table "vendor_research" add constraint "vendor_research_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_research" cascade;`);
  }

}
