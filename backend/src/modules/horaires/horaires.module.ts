import { Module } from '@nestjs/common';
import { HorairesController } from './horaires.controller.js';
import { HorairesService } from './horaires.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HorairesController],
  providers: [HorairesService],
})
export class HorairesModule {}
