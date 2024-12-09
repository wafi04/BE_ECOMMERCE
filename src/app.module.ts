import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// Internal Imports
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

// Config Imports
import jwtConfig from './config/jwt.config';

// Guards and Interceptors
import { ResponseInterceptor } from './common/interceptor/reponse.interceptor';

// Middleware
import { AuthMiddleware } from './middlewares/auth.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import CategoryModule from './modules/categories/Category.module';
import { CloudinaryModule } from './modules/cloudinary/CLoudinary.module';
import { ProductModule } from './modules/product/product.module';
import { VariantsModule } from './modules/variants/variants.module';
import { SeederModule } from './modules/seeder/seeder.module';

@Module({
  // Organize imports in a logical order
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      cache: true,
    }),

    // Feature Modules
    VariantsModule,
    CloudinaryModule,
    SeederModule,
    ProductModule,
    AuthModule,
    CategoryModule,
    PrismaModule,
  ],

  // Controllers
  controllers: [AppController],

  // Providers with clear categorization
  providers: [
    // Services
    AppService,
    PrismaService,
    JwtService,

    // Global Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // Global Guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  // Middleware configuration with clear exclusions
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Publicly accessible routes
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
