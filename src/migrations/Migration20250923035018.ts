import { Migration } from '@mikro-orm/migrations';

export class Migration20250923035018 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "vendor_claim" ("id" serial primary key, "vendor_id" int not null, "user_id" int not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "first_name" text not null, "last_name" text not null, "email" text not null, "phone" text not null, "title" text not null, "company_email" text not null, "verification_method" text check ("verification_method" in ('email', 'phone', 'website', 'linkedin')) not null, "message" text null, "submitted_at" timestamptz not null, "reviewed_at" timestamptz null, "reviewed_by_id" int null, "rejection_reason" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "notification" ("id" serial primary key, "user_id" int not null, "type" text check ("type" in ('demo_request', 'claim_approved', 'document_request', 'review_submitted')) not null, "title" text not null, "message" text not null, "is_read" boolean not null default false, "action_url" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "demo_request" ("id" serial primary key, "vendor_id" int not null, "requester_id" int not null, "status" text check ("status" in ('pending', 'scheduled', 'completed', 'cancelled')) not null default 'pending', "first_name" text not null, "last_name" text not null, "email" text not null, "phone" text null, "bank_name" text not null, "title" text not null, "assets_under_management" text not null, "current_provider" text null, "timeline" text not null, "preferred_time" text not null, "message" text null, "scheduled_at" timestamptz null, "completed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "compliance_document" ("id" serial primary key, "vendor_id" int not null, "title" text not null, "description" text null, "type" text check ("type" in ('security-audit', 'security-certification', 'regulatory-assessment', 'operational-documentation', 'legal-documentation')) not null, "confidentiality" text check ("confidentiality" in ('public', 'restricted', 'confidential')) not null, "status" text check ("status" in ('current', 'expiring', 'expired')) not null, "last_updated" timestamptz not null, "expires_at" timestamptz null, "size" text null, "file_url" text not null, "required_approval" boolean not null default false, "download_count" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "document_access_request" ("id" serial primary key, "document_id" int not null, "user_id" int not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "justification" text null, "requested_at" timestamptz not null, "approved_at" timestamptz null, "approved_by_id" int null, "rejected_at" timestamptz null, "rejection_reason" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "vendor_subscription" ("id" serial primary key, "user_id" int not null, "vendor_id" int not null, "is_active" boolean not null default true, "subscribed_at" timestamptz not null, "unsubscribed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`create index "vendor_subscription_vendor_id_index" on "vendor_subscription" ("vendor_id");`);
    this.addSql(`alter table "vendor_subscription" add constraint "vendor_subscription_user_id_vendor_id_unique" unique ("user_id", "vendor_id");`);

    this.addSql(`alter table "vendor_claim" add constraint "vendor_claim_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "vendor_claim" add constraint "vendor_claim_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "vendor_claim" add constraint "vendor_claim_reviewed_by_id_foreign" foreign key ("reviewed_by_id") references "user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "demo_request" add constraint "demo_request_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "demo_request" add constraint "demo_request_requester_id_foreign" foreign key ("requester_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "compliance_document" add constraint "compliance_document_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);

    this.addSql(`alter table "document_access_request" add constraint "document_access_request_document_id_foreign" foreign key ("document_id") references "compliance_document" ("id") on update cascade;`);
    this.addSql(`alter table "document_access_request" add constraint "document_access_request_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "document_access_request" add constraint "document_access_request_approved_by_id_foreign" foreign key ("approved_by_id") references "user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "vendor_subscription" add constraint "vendor_subscription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "vendor_subscription" add constraint "vendor_subscription_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "document_access_request" drop constraint "document_access_request_document_id_foreign";`);

    this.addSql(`drop table if exists "vendor_claim" cascade;`);

    this.addSql(`drop table if exists "notification" cascade;`);

    this.addSql(`drop table if exists "demo_request" cascade;`);

    this.addSql(`drop table if exists "compliance_document" cascade;`);

    this.addSql(`drop table if exists "document_access_request" cascade;`);

    this.addSql(`drop table if exists "vendor_subscription" cascade;`);
  }

}
