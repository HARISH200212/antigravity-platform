import {
  Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService, LoginDto, RegisterDto } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

class LoginBody implements LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(4) password: string;
}

class RegisterBody implements RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() name: string;
  @IsString() role: any;
  @IsString() labGroup: string;
  @IsString() tenantId: string;
}

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and obtain JWT access token' })
  @ApiResponse({ status: 200, description: 'Returns JWT access token and user profile' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginBody) {
    return this.auth.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  register(@Body() dto: RegisterBody) {
    return this.auth.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  me(@Request() req: any) {
    const user = this.auth.findById(req.user.sub);
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all users (admin only)' })
  listUsers() {
    return this.auth.listUsers();
  }
}
