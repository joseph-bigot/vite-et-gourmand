
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InscriptionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  motDePasse!: string;
}
