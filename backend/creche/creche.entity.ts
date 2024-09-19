/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Child } from '../child/child.entity';

@Entity()
export class Creche {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User, user => user.creches)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToMany(() => Child, child => child.creches)
  @JoinTable({
    name: 'child_creche',
    joinColumn: { name: 'creche_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'child_id', referencedColumnName: 'id' },
  })
  children: Child[];
}
