import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { Token } from "src/entities/token.entity";
import { User } from "src/entities/user.entity";

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
  entities: ['./dist/entities'],
  entitiesTs: ['src/entities'],
  // entities: [User, Token],
  dbName: 'haystack',
  driver: PostgreSqlDriver
});