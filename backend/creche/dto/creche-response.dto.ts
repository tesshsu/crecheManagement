import { Creche } from '../creche.entity';
import { Child } from '../../child/child.entity';
import { User } from '../../user/user.entity';

export class CrecheResponseDto {
  id: number;
  name: string;
  creator_id: number;
  creator: User;
  children: Child[];

  constructor(creche: Creche) {
    this.id = creche.id;
    this.name = creche.name;
    this.creator_id = creche.creator?.id;
    this.creator = creche.creator;
    this.children = creche.children;
  }
}