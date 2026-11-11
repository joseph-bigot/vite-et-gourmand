import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ModifierProfilDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string | null;
}
