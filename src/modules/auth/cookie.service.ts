// src/common/services/cookie.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CookieOptions } from 'express';
import { AuthTokens, TokenPayload } from './auth.service';

export interface TokenCookieConfig {
  name: string;
  token: string;
  isAccessToken: boolean;
}

@Injectable()
export class CookieService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(CookieService.name);
  generateTokens(payload: TokenPayload): AuthTokens {
    try {
      return {
        accessToken: this.jwtService.sign(payload, {
          secret: this.configService.get('jwt.accessToken.secret'),
          expiresIn: this.configService.get('jwt.accessToken.expiresIn'),
        }),
        refreshToken: this.jwtService.sign(payload, {
          secret: this.configService.get('jwt.refreshToken.secret'),
          expiresIn: this.configService.get('jwt.refreshToken.expiresIn'),
        }),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error generating tokens');
    }
  }
  private getCookieOptions(isAccessToken: boolean): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: isAccessToken
        ? 1 * 24 * 60 * 60 * 1000 // 15 minutes for access token
        : 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    };
  }

  setCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    try {
      // Set Access Token Cookie
      response.cookie(
        'access_token',
        tokens.accessToken,
        this.getCookieOptions(true),
      );

      // Set Refresh Token Cookie
      response.cookie(
        'refresh_token',
        tokens.refreshToken,
        this.getCookieOptions(false),
      );
    } catch (error) {
      this.logger.error('Error setting cookies', error);
      throw new Error('Failed to set authentication cookies');
    }
  }

  clearTokenCookies(res: Response): void {
    try {
      // Clear both access and refresh tokens
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      };

      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);
    } catch (error) {
      this.logger.error('Error clearing cookies', error);
      throw new Error('Failed to clear authentication cookies');
    }
  }

  extractTokenFromCookie(
    req: Request,
    tokenType: 'access_token' | 'refresh_token',
  ): string | null {
    try {
      const cookies = (req as any).cookies;
      return cookies?.[tokenType] || null;
    } catch (error) {
      this.logger.error('Error extracting token from cookie', error);
      return null;
    }
  }
}
