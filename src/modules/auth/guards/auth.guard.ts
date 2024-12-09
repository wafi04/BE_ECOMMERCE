import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Endpoint isPublic: ${isPublic}`);

    if (isPublic) {
      this.logger.debug('Public endpoint accessed');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    this.logger.debug(
      `Token extracted from cookie: ${token ? 'exists' : 'missing'}`,
    );

    if (!token) {
      this.logger.warn('No token found in cookies');
      throw new UnauthorizedException('No access token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.debug('Token verified successfully');
      request['user'] = payload;
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = request.cookies['access_token'];
    this.logger.debug(
      `Cookie extraction attempt: ${token ? 'found' : 'not found'}`,
    );
    return token;
  }
}