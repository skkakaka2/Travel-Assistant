import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, SetCarDto, SetHomeDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ContextUser } from 'src/auth/decorators/contextuser.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('set-home')
  setHome(@Body() setHomeDto: SetHomeDto, @ContextUser() user: ContextUser) {
    return this.userService.setHome(setHomeDto, user);
  }

  @Get('me')
  me(@ContextUser() user: ContextUser) {
    return this.userService.findOne(user.userId);
  }

  @Get('has-home')
  hasHome(@ContextUser() user: ContextUser) {
    return this.userService.hasHome(user);
  }

  @Post('set-car')
  setCar(@Body() setCarDto: SetCarDto, @ContextUser() user: ContextUser) {
    return this.userService.setCar(setCarDto, user);
  }
}
