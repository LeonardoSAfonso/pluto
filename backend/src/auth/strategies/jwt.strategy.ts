import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { AuthenticatedUserPayload } from '../domain/auth-response.dto';
import AppError from 'src/shared/AppError';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  public async validate(payload: JwtPayload): Promise<AuthenticatedUserPayload> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new AppError('Token JWT inválido ou corrompido', 401);
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? '',
    };
  }
}
