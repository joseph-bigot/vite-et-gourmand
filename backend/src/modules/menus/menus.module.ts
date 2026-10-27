import { Module } from '@nestjs/common';
import { MenusController } from './menus/menus.controller.js';
import { MenusService } from './menus/menus.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
