import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangerMotDePasseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  ancienMotDePasse!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{10,72}$/, {
    message:
      'Le nouveau mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
  })
  nouveauMotDePasse!: string;
}
