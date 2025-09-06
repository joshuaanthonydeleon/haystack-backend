import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService, SignInDto, SignUpDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}