import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  genererJeton(utilisateur: {
    id_utilisateur: string;
    email: string;
    role: string;
  }): string {
    return this.jwtService.sign({
      sub: utilisateur.id_utilisateur,
      email: utilisateur.email,
      role: utilisateur.role,
    });
  }
}