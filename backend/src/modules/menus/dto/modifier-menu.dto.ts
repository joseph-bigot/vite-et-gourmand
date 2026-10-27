import { PartialType } from '@nestjs/mapped-types';
import { CreerMenuDto } from './creer-menu.dto.js';

export class ModifierMenuDto extends PartialType(CreerMenuDto) {}
