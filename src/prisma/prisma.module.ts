import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 使 PrismaService 在整个应用中可用，无需在每个模块中导入
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

