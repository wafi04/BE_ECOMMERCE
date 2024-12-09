import {
  Injectable,
  UnauthorizedException,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { ROLE, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UserData } from 'src/common/interfaces/user';
import { PrismaService } from 'src/prisma/prisma.service';
import { CookieService } from './cookie.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/Register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface TokenVerificationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
}
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cookiesService: CookieService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    try {
      // Check if email or name already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { name: name }],
        },
      });

      if (existingUser) {
        throw new UnauthorizedException(
          existingUser.email === email
            ? 'Email sudah terdaftar'
            : 'Nama pengguna sudah digunakan',
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      let role: ROLE;
      if (email === 'admin@admin.com') {
        role = 'ADMIN';
      } else {
        role = 'USER';
      }
      // Create user
      const user = await this.prisma.user.create({
        data: {
          name,
          role,
          email,
          password: hashedPassword,
        },
      });

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Registration error', error);
      throw new UnauthorizedException(error.message || 'Registrasi gagal');
    }
  }

  async login(loginDto: LoginDto, @Res() res: Response) {
    const { name, password } = loginDto;

    try {
      // Validate user
      const user = await this.validateUser(name, password);

      if (!user) {
        throw new UnauthorizedException('Email atau password salah');
      }

      // Generate tokens
      const tokens = this.cookiesService.generateTokens({
        email: user.email,
        sub: user.id,
        role: user.role,
      });

      // Set cookies
      this.cookiesService.setCookies(res, tokens);

      // Prepare response

      return res.status(HttpStatus.OK).json({
        message: 'Login berhasil',
        user,
      });
    } catch (error) {
      this.logger.error('Login error', error);
      throw new UnauthorizedException(error.message || 'Login gagal');
    }
  }

  async getProfile(userId: string): Promise<UserData> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async validateUser(name: string, password: string): Promise<UserData | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          name,
        },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      //   tanpa menggunakan password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      this.logger.error('User validation error', error);
      return null;
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verifikasi refresh token
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refreshToken.secret'),
      });

      // Cari user sekali saja dengan metode findUnique
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = this.cookiesService.generateTokens({
        email: user.email,
        sub: user.id,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(@Res() res: Response) {
    try {
      // Clear both access and refresh tokens
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.status(HttpStatus.OK).json({
        message: 'Logout berhasil',
      });
    } catch (error) {
      this.logger.error('Logout error', error);
      throw new UnauthorizedException('Logout gagal');
    }
  }
  async verifyToken(token: string): Promise<TokenVerificationResult> {
    if (!token) {
      return {
        isValid: false,
        error: 'Token is required',
      };
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('jwt.accessToken.secret'),
      });

      // Verifikasi bahwa user masih ada di database
      const user = await this.getProfile(payload.sub);
      if (!user) {
        return {
          isValid: false,
          error: 'User not found',
        };
      }

      return {
        isValid: true,
        payload: {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return {
          isValid: false,
          error: 'Invalid token',
        };
      }

      return {
        isValid: false,
        error: 'Error verifying token',
      };
    }
  }
}
