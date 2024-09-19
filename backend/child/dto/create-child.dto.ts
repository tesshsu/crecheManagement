import { IsString } from 'class-validator';

export class CreateChildDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}