import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Creche } from '../creche/creche.entity';

@Entity()
export class Child {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User, user => user.children)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToMany(() => Creche, creche => creche.children)
  creches: Creche[];
}