import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';

@Module({
  imports: [MikroOrmModule.forRoot({
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    dbName: 'haystack',
    driver: PostgreSqlDriver,
  })],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule { }
