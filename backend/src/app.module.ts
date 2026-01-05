import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpResponseInterceptor } from './http-response/http-response.interceptor';
import { HttpExceptionFilter } from './http-response/http-exception.filter';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';
import { ValidationPipe } from '@nestjs/common';
import { DayPlanModule } from './day-plan/day-plan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayPlanItem } from './day-plan-item/entities/day-plan-item.entity';
import { DayPlan } from './day-plan/entities/day-plan.entity';
import { Trip } from './trip/entities/trip.entity';
import { User } from './user/entities/user.entity';
import { DayPlanItemModule } from './day-plan-item/day-plan-item.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const baseConfig = {
          type: 'mysql' as const,
          entities: [User, Trip, DayPlan, DayPlanItem],
          synchronize: false,
          logging: false,
          autoLoadEntities: true,
        };

        if (process.env.DATABASE_URL) {
          return {
            ...baseConfig,
            url: process.env.DATABASE_URL,
          };
        } else {
          throw new Error('DATABASE_URL is not set');
        }
      },
    }),
    AuthModule,
    TripModule,
    UserModule,
    DayPlanModule,
    DayPlanItemModule,
  ],
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
