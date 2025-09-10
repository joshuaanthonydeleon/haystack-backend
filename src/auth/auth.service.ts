import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload } from './jwt.strategy';

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
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
    });

    return user;
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string; user: Omit<User, 'passwordHash'> }> {
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

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({ id: userId });
  }
}