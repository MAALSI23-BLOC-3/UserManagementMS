import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetRefreshResponse,
  LoginDto,
  PostLoginResponse,
} from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import JwtRefreshGuard from '../guards/jwt-refresh.guard';
import { PayloadToken } from '../models/token.model';
import { AuthService } from '../services/auth.service';

type AuthorizedRequest = Express.Request & {
  headers: { authorization: string };
  user: PayloadToken;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ type: PostLoginResponse, status: 200 })
  @HttpCode(200)
  @Post('login')
  login(@Body() body: LoginDto) {
    try {
      return this.authService.login(body);
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logOut(@Request() req: { user: PayloadToken }) {
    try {
      await this.authService.logout(req.user);
    } catch (error) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, type: GetRefreshResponse })
  @ApiBearerAuth('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req: AuthorizedRequest) {
    return this.authService.createAccessTokenFromRefreshToken(req.user);
  }

  @ApiOperation({ summary: 'Validate user using their token' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async validateUser(@Request() req: { user: PayloadToken }) {
    try {
      const user = await this.authService.validateToken(req.user);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
