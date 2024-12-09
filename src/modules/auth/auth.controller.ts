import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/Register.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/user';
import { CookieService } from './cookie.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger();
  constructor(
    private readonly authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    this.logger.log(loginDto);
    return this.authService.login(loginDto, res);
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    try {
      // Ambil refresh token dari cookies
      const refreshToken = req.cookies['refresh_token'];

      if (!refreshToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Refresh token tidak tersedia',
        });
      }

      // Refresh tokens
      const newTokens = await this.authService.refreshTokens(refreshToken);

      // Set cookies baru
      const cookies = this.cookieService.setCookies(res, newTokens);

      return res.status(200).json({
        cookies,
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Gagal memperbarui token',
        error: error.message,
      });
    }
  }
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user.sub);
  }

  @Get('verify')
  async verifyToken(@Req() request: Request) {
    const accessToken = request.cookies['access_token'];
    if (!accessToken) {
      throw new UnauthorizedException();
    }
    return this.authService.verifyToken(accessToken);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
