import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import UserRepository from 'src/users/repository';
import AppError from 'src/shared/AppError';
import { LoginDTO } from '../domain/login.dto';
import { AuthResponseDTO } from '../domain/auth-response.dto';

@Injectable()
export default class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(data: LoginDTO): Promise<AuthResponseDTO> {
    const email = data.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
