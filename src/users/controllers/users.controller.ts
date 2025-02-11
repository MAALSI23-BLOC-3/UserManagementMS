import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/models/roles.model';
import {
  CreateAdminDto,
  CreateUserDto,
  DefaultColumnsResponse,
  UpdateUserDto,
} from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('users') // put the name of the controller in swagger
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard) //  makes the all routs as private by default
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'create a user with customer role' })
  @ApiResponse({
    status: 201,
    type: DefaultColumnsResponse,
  })
  @Public() // makes the endpoint accessible to all
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'create a user with admin role' })
  @ApiResponse({
    status: 201,
    type: DefaultColumnsResponse,
  })
  @ApiBearerAuth('access-token') // in the swagger documentation, a bearer token is required to access this endpoint
  @Roles(Role.ADMIN) // makes the endpoint accessible only by the admin
  @Post('admin')
  createAdmin(@Body() creatAdminDto: CreateAdminDto) {
    return this.usersService.create(creatAdminDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Roles(Role.ADMIN)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: DefaultColumnsResponse,
  })
  @ApiBearerAuth('access-token')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    type: DefaultColumnsResponse,
  })
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
