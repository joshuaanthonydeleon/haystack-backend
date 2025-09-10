import { Controller, Post, Body, UseGuards, Get, Request, Query } from '@nestjs/common';
import { 
  AuthService, 
  SignInDto, 
  SignUpDto, 
  // RefreshTokenDto, 
  // ForgotPasswordDto, 
  // ResetPasswordDto, 
  // VerifyEmailDto 
} from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
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

  // @Post('refresh')
  // async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
  //   return this.authService.refreshToken(refreshTokenDto);
  // }

  // @Post('forgot-password')
  // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(forgotPasswordDto);
  // }

  // @Post('reset-password')
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  //   return this.authService.resetPassword(resetPasswordDto);
  // }

  // @Post('verify-email')
  // async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
  //   return this.authService.verifyEmail(verifyEmailDto);
  // }

  // @Post('resend-verification')
  // async resendVerificationEmail(@Query('email') email: string) {
  //   return this.authService.resendVerificationEmail(email);
  // }
}