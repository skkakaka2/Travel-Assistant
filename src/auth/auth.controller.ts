import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorator';
import type { FastifyReply } from 'fastify';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.login(loginDto);
    res.setCookie('token', result, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天（秒）
      path: '/',
      sameSite: 'strict',
    });
    return result;
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
