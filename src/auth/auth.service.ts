import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../entities/user.entity';
import { Token, TokenType } from '../entities/token.entity';
import { JwtPayload } from './jwt.strategy';
import { EmailService } from './email.service';

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  role: UserRole;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: EntityRepository<Token>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ user: User; message: string }> {
    const { email, password, role } = signUpDto;
    
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      email,  
      passwordHash,
      role,
      isEmailVerified: false,
    });

    await this.em.persistAndFlush(user);

    // Generate email verification token
    const verificationToken = await this.generateToken(user.id, TokenType.EMAIL_VERIFICATION);
    
    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken.token);

    return {
      user,
      message: 'User created successfully. Please check your email to verify your account.'
    };
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string; refresh_token: string; user: Omit<User, 'passwordHash'> }> {
    const { email, password } = signInDto;
    
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    
    // Generate refresh token
    const refreshToken = await this.generateToken(user.id, TokenType.REFRESH);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      access_token,
      refresh_token: refreshToken.token,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string; refresh_token: string }> {
    const { refreshToken } = refreshTokenDto;
    
    // Find the refresh token
    const token = await this.tokenRepository.findOne({
      token: refreshToken,
      type: TokenType.REFRESH,
      isUsed: false,
    }, { populate: ['user'] });

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new access token
    const payload: JwtPayload = {
      sub: token.user.id,
      email: token.user.email,
      role: token.user.role,
    };

    const access_token = this.jwtService.sign(payload);
    
    // Generate new refresh token
    const newRefreshToken = await this.generateToken(token.user.id, TokenType.REFRESH);
    
    // Mark old refresh token as used
    token.isUsed = true;
    await this.em.persistAndFlush(token);

    return {
      access_token,
      refresh_token: newRefreshToken.token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate password reset token
    const resetToken = await this.generateToken(user.id, TokenType.PASSWORD_RESET);
    
    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken.token);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    
    // Find the password reset token
    const resetToken = await this.tokenRepository.findOne({
      token,
      type: TokenType.PASSWORD_RESET,
      isUsed: false,
    }, { populate: ['user'] });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    resetToken.user.passwordHash = passwordHash;
    await this.em.persistAndFlush(resetToken.user);

    // Mark token as used
    resetToken.isUsed = true;
    await this.em.persistAndFlush(resetToken);

    return { message: 'Password has been reset successfully.' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto;
    
    // Find the email verification token
    const verificationToken = await this.tokenRepository.findOne({
      token,
      type: TokenType.EMAIL_VERIFICATION,
      isUsed: false,
    }, { populate: ['user'] });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark user email as verified
    verificationToken.user.isEmailVerified = true;
    await this.em.persistAndFlush(verificationToken.user);

    // Mark token as used
    verificationToken.isUsed = true;
    await this.em.persistAndFlush(verificationToken);

    return { message: 'Email has been verified successfully.' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new email verification token
    const verificationToken = await this.generateToken(user.id, TokenType.EMAIL_VERIFICATION);
    
    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken.token);

    return { message: 'Verification email has been sent.' };
  }

  private async generateToken(userId: number, type: TokenType): Promise<Token> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    
    // Set expiration based on token type
    switch (type) {
      case TokenType.REFRESH:
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        break;
      case TokenType.PASSWORD_RESET:
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour
        break;
      case TokenType.EMAIL_VERIFICATION:
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
        break;
    }

    const tokenEntity = this.tokenRepository.create({
      token,
      type,
      expiresAt,
      user: userId,
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(tokenEntity);
    return tokenEntity;
  }

  async validateUser(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({ id: userId });
  }
}