import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Creche } from '../creche/creche.entity';
import { Child } from '../child/child.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;
  
  @OneToMany(() => Creche, (creche) => creche.creator)
  creches: Creche[];

  @OneToMany(() => Child, (child) => child.creator)
  children: Child[];
}
