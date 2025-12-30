import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: createUserDto.username,
      },
    });
    if (user) {
      return errorResponse('User already exists', null);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const result = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return successResponse(result);
  }

  async findAll() {
    const result = await this.prisma.user.findMany();
    return successResponse(result);
  }

  async findOne(id: number) {
    const result = await this.prisma.user.findUnique({
      where: { id },
    });
    return successResponse(result);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return successResponse(result);
  }

  async remove(id: number) {
    const result = await this.prisma.user.delete({
      where: { id },
    });
    return successResponse(result);
  }
}
