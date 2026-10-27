import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreerAvisDto {
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'Identifiant de commande invalide.',
  })
  id_commande!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  commentaire!: string;
}
