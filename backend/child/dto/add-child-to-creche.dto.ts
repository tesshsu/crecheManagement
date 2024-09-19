import { IsInt, IsPositive } from 'class-validator';

export class AddChildToCrecheDto {
  @IsInt()
  @IsPositive()
  child_id: number;

  @IsInt()
  @IsPositive()
  creche_id: number;
}