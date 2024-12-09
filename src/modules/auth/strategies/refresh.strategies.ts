import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Ambil refresh token dari cookie
          return request?.cookies?.refreshToken;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, 
      passReqToCallback: true, 
    });
  }

  async validate(req: Request, payload: { sub: string, email: string }) {
    // Ambil refresh token dari request
    const refreshToken = req?.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Cek user di database
    const user = await this.prisma.user.findUnique({
      where: { 
        id: payload.sub,
        email: payload.email 
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Tambahkan refresh token ke return value
    return { 
      ...user, 
      refreshToken 
    };
  }
}