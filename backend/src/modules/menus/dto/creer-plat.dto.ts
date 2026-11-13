import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreerPlatDto {
  @IsString()
  @MinLength(2)
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['entree', 'plat', 'dessert'])
  categorie!: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  allergenes?: number[];
}
