import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { Token } from "src/entities/token.entity";
import { User } from "src/entities/user.entity";
import { Vendor } from "src/entities/vendor.entity";
import { VendorProfile } from "src/entities/vendor-profile.entity";
import { Rating } from "src/entities/rating.entity";
import { VendorResearch } from "src/entities/vendor-research.entity";
import { ComplianceDocument } from "src/entities/compliance-document.entity";
import { DemoRequest } from "src/entities/demo-request.entity";
import { VendorClaim } from "src/entities/vendor-claim.entity";
import { VendorSubscription } from "src/entities/vendor-subscription.entity";
import { DocumentAccessRequest } from "src/entities/document-access-request.entity";
import { Notification } from "src/entities/notification.entity";

export default defineConfig({
  // contextName: 'app',
  user: 'joshua.deleon',
  password: 'school10',
  host: 'sneakybot',
  port: 5432,
  extensions: [Migrator],
  migrations: {
    tableName: 'migrations',
    path: './dist/migrations',
    pathTs: './src/migrations',
    transactional: true,
  },
  // entities: ['./dist/entities'],
  // entitiesTs: [User, Token],
  entities: [
    User,
    Token,
    Vendor,
    VendorProfile,
    Rating,
    VendorResearch,
    VendorClaim,
    VendorSubscription,
    DemoRequest,
    ComplianceDocument,
    DocumentAccessRequest,
    Notification
  ],
  dbName: 'haystack',
  driver: PostgreSqlDriver
});