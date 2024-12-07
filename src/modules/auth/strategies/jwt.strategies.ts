import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Gunakan secret yang berbeda
    });
  }

  async validate(payload: { sub: string, email: string }) {
    // Tambahkan pengecekan user di database
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

    return user;
  }
}