import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ExampleModule } from './example/example.module';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/entities'],
      entitiesTs: ['./src/entities'],
      dbName: 'haystack',
      driver: PostgreSqlDriver,
    }),
    AuthModule,
    ExampleModule,
  ],
})
export class AppModule { }
