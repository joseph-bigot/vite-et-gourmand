import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Utilisateur } from '../utilisateurs/entities/utilisateur.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Utilisateur)
    private readonly utilisateursRepository: Repository<Utilisateur>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('La variable JWT_SECRET doit être définie.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    const utilisateur = await this.utilisateursRepository.findOne({
      where: { id_utilisateur: payload.sub },
    });

    if (
      !utilisateur ||
      !utilisateur.actif ||
      utilisateur.email !== payload.email ||
      utilisateur.role !== payload.role
    ) {
      throw new UnauthorizedException(
        'Session invalide ou compte désactivé. Veuillez vous reconnecter.',
      );
    }

    return {
      id_utilisateur: utilisateur.id_utilisateur,
      email: utilisateur.email,
      role: utilisateur.role,
    };
  }
}
