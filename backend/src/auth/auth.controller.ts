import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import LoginService from './services/login';
import { LoginDTO } from './domain/login.dto';
import { AuthResponseDTO, AuthenticatedUserPayload } from './domain/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: LoginDTO): Promise<AuthResponseDTO> {
    return this.loginService.execute(loginDto);
  }

  @Get('me')
  public async getProfile(
    @CurrentUser() user: AuthenticatedUserPayload,
  ): Promise<AuthenticatedUserPayload> {
    return user;
  }
}
