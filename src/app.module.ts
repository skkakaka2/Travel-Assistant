import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HttpResponseInterceptor } from './http-response/http-response.interceptor';
import { HttpExceptionFilter } from './http-response/http-exception.filter';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, TripModule, UserModule],
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
  ],
})
export class AppModule {}
