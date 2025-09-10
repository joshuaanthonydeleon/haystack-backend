import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { EmailService } from './email.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Token]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }