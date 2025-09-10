import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import mikroConfig from 'mikro.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroConfig),
    AuthModule,
  ],
})
export class AppModule { }
