import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('La variable JWT_SECRET doit être définie.');
        }

        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule, PassportModule, RolesGuard],
})
export class AuthModule {}
