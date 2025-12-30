import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HttpResponseInterceptor } from './http-response/http-response.interceptor';
import { HttpExceptionFilter } from './http-response/http-exception.filter';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';
import { ValidationPipe } from '@nestjs/common';
import { DayPlanModule } from './day-plan/day-plan.module';

@Module({
  imports: [PrismaModule, AuthModule, TripModule, UserModule, DayPlanModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
