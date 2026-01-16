import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginDto.username,
      },
    });
    if (!user) {
      return errorResponse('Invalid username or password', null);
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      return errorResponse('Invalid username or password', null);
    }
    // 设置 token 过期时间（默认 7 天）
    const expiresIn = process.env.TOKEN_EXP || '7d'; // 支持 '7d', '24h', '3600' 等格式

    // Kong JWT 插件需要的 Consumer key（从环境变量读取，默认为 'travel-assistant-key'）
    // 这个 key 必须与 Kong 中创建的 Consumer JWT Credential 的 key 一致
    const kongConsumerKey = process.env.KONG_CONSUMER_KEY || 'travel-assistant-key';

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        kongKey: kongConsumerKey,
      },
      process.env.JWT_SECRET,
      {
        expiresIn, // 使用 expiresIn 选项，而不是在 payload 中设置 exp
      },
    );
    return successResponse(token);
  }
}
