import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersSeederService } from './services/user.seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersSeederService],
  exports: [UsersSeederService],
})
export class UserSeederModule {}
