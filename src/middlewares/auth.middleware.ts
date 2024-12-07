import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];

    if (!accessToken && !refreshToken) {
      return res.redirect('/auth/login');
    }

    try {
      // Verifikasi access token
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get('jwt.accessToken.secret'),
      });
      req['user'] = payload;
      next();
    } catch (error) {
      // Jika access token tidak valid, coba gunakan refresh token
      if (refreshToken) {
        try {
          const refreshPayload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get('jwt.refreshToken.secret'),
          });

          // Generate access token baru
          const newAccessToken = this.jwtService.sign(
            { userId: refreshPayload.userId },
            {
              secret: this.configService.get('jwt.accessToken.secret'),
              expiresIn: this.configService.get('jwt.accessToken.expiresIn'),
            },
          );

          // Set access token baru di cookie
          res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });

          req['user'] = refreshPayload;
          next();
        } catch (refreshError) {
          return res.redirect('/auth/login');
        }
      } else {
        return res.redirect('/auth/login');
      }
    }
  }
}
