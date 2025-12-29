import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: loginDto.username,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    // 设置 token 过期时间（默认 7 天）
    const expiresIn = process.env.TOKEN_EXP || '7d'; // 支持 '7d', '24h', '3600' 等格式

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn, // 使用 expiresIn 选项，而不是在 payload 中设置 exp
      },
    );
    return token;
  }
}
