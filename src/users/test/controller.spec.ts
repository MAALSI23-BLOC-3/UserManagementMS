import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/models/roles.model';
import {
  CreateUserDto,
  CreateAdminDto,
  UpdateUserDto,
} from '../dto/create-user.dto';
import { UsersController } from '../controllers/users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test',
        password: 'test',
        firstName: 'test',
        lastName: 'test',
      };
      const result = {
        email: createUserDto.email,
        role: Role.CUSTOMER,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      };
      jest
        .spyOn(usersService, 'create')
        .mockImplementation(async (createUserDto) => result);
      expect(await usersController.create(createUserDto)).toBe(result);
    });
  });

  describe('createAdmin', () => {
    it('should create an admin user', async () => {
      const createAdminDto: CreateAdminDto = {
        email: 'test@admin',
        password: 'test',
        firstName: 'test',
        lastName: 'test',
        role: Role.ADMIN,
      };
      const result = {
        email: createAdminDto.email,
        role: Role.ADMIN,
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
      };
      jest.spyOn(usersService, 'create').mockImplementation(async () => result);
      expect(await usersController.createAdmin(createAdminDto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [];
      jest
        .spyOn(usersService, 'findAll')
        .mockImplementation(async () => result);

      expect(await usersController.findAll()).toBeInstanceOf(Array);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = null;
      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(async () => result);

      expect(await usersController.findOne('1')).toBeDefined();
    });
  });

  describe('update', () => {
    it('should fail to update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@test',
      };
      const result = {
        email: updateUserDto.email,
      };
      jest.spyOn(usersService, 'update').mockImplementation(async () => null);

      expect(await usersController.update('1', updateUserDto)).toBe(null);
    });
  });

  describe('remove', () => {
    it('should fail to remove a user', async () => {
      jest.spyOn(usersService, 'remove').mockImplementation(async () => null);

      expect(await usersController.remove('8')).toBe(null);
    });
  });
});
