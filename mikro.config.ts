import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { Token } from "src/entities/token.entity";
import { User } from "src/entities/user.entity";
import { Vendor } from "src/entities/vendor.entity";
import { VendorProfile } from "src/entities/vendor-profile.entity";
import { Rating } from "src/entities/rating.entity";

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
  entities: [User, Token, Vendor, VendorProfile, Rating],
  dbName: 'haystack',
  driver: PostgreSqlDriver
});