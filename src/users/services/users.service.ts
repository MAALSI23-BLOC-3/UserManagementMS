import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import {
  CreateAdminDto,
  CreateUserDto,
  UpdateUserDto,
} from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto | CreateAdminDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (user) {
      throw new BadRequestException();
    }

    const createdUser = this.userRepository.create(createUserDto);
    const saveUser = await this.userRepository.save(createdUser);
    // @ts-ignore
    delete saveUser.password;
    // @ts-ignore
    delete saveUser.refreshToken;

    return saveUser;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findByEmailAndGetPassword(email: string) {
    return await this.userRepository.findOne({
      select: ['id', 'password', 'role'],
      where: { email },
    });
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findById(userId: number) {
    return await this.userRepository.findOneByOrFail({ id: userId });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneOrFail({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      return null;
    }
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return this.userRepository.remove(user);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    //crypto is a node module, and bcrypt the maximum length of the hash is 60 characters, and token is longer than that, so we need to hash it
    const hash = createHash('sha256').update(refreshToken).digest('hex');

    const currentHashedRefreshToken = await bcrypt.hashSync(hash, 10);
    return await this.userRepository.update(
      { id: userId },
      {
        refreshToken: currentHashedRefreshToken,
      },
    );
  }

  async removeRefreshToken(userId: number) {
    await this.findById(userId);

    return this.userRepository.update(
      { id: userId },
      {
        refreshToken: undefined,
      },
    );
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<{ id: number; role: string } | undefined> {
    const user = await this.userRepository.findOne({
      select: ['id', 'refreshToken', 'role'],
      where: { id: userId },
    });

    if (!user || !user.refreshToken) return;

    const hash = createHash('sha256').update(refreshToken).digest('hex');
    const isRefreshTokenMatching = await bcrypt.compare(
      hash,
      user.refreshToken,
    );
    if (isRefreshTokenMatching) {
      return { id: user?.id, role: user?.role };
    }
  }
}
