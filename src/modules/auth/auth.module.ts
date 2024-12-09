import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CookieService } from './cookie.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.accessToken.secret'),
        signOptions: configService.get('jwt.accessToken.expiresIn'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PrismaService, JwtService, CookieService],
  controllers: [AuthController],
})
export class AuthModule {}
