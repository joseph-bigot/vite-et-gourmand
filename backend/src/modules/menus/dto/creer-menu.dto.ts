import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompositionMenuDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_plat!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  ordre_affichage!: number;
}

export class CreerMenuDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_theme!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_regime!: number;

  @IsString()
  @MinLength(2)
  titre!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prix_par_personne!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  nombre_minimum_personnes!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @MinLength(2)
  conditions_commande!: string;

  @IsString()
  @MinLength(2)
  conditions_conservation!: string;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompositionMenuDto)
  plats!: CompositionMenuDto[];
}
