import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @IsIn(['Madame', 'Monsieur', 'Autre'])
  civilite!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;
}
