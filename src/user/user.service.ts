import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  errorResponse,
  successResponse,
} from 'src/http-response/http-response';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });
    if (user) {
      return errorResponse('User already exists', null);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const entity = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const result = await this.userRepository.save(entity);
    return successResponse(result);
  }

  async findAll() {
    const result = await this.userRepository.find();
    return successResponse(result);
  }

  async findOne(id: number) {
    const result = await this.userRepository.findOne({
      where: { id },
    });
    return successResponse(result);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id }, updateUserDto);
    const updated = await this.userRepository.findOne({ where: { id } });
    return successResponse(updated);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return errorResponse('User not found', null);
    }
    await this.userRepository.delete({ id });
    return successResponse(user);
  }
}
