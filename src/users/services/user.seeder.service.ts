import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
@Injectable()
export class UsersSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get('NODE_ENV') === 'dev') await this.seed();
  }

  async seed() {
    const existingProducts = await this.userRepository.count();
    if (existingProducts === 0) {
      await this.userRepository.save(await this.getUsers());
    }
  }

  private async getUsers(): Promise<CreateUserDto[]> {
    const admin: CreateUserDto = {
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@admin.com',
      password: await bcrypt.hash('admin', 10),
      birthDate: new Date(),
      phoneNumber: '1234567890',
    };

    const user: CreateUserDto = {
      firstName: 'user',
      lastName: 'user',
      email: 'user@user.com',
      password: await bcrypt.hash('user', 10),
      birthDate: new Date(),
      phoneNumber: '0987654321',
    };

    return [admin, user];
  }
}
