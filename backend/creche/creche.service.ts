import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Creche } from './creche.entity';
import { User } from '../user/user.entity';
import { Child } from '../child/child.entity';
import { EmailNotificationService } from '../src/services/email-notification.service';

@Injectable()
export class CrecheService {
  constructor(
    @InjectRepository(Creche)
    private crecheRepository: Repository<Creche>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Creche[]> {
    return this.crecheRepository.find({
      relations: ['creator'],
    });
  }

  async findOne(id: number): Promise<Creche | null> {
    return this.crecheRepository.findOne({
      where: { id },
      relations: ['creator', 'children'],
    });
  }

  async create(name: string, username: string): Promise<Creche> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const creche = this.crecheRepository.create({ name, creator: user });
    return this.crecheRepository.save(creche);
  }

  async delete(id: number, username: string): Promise<{ message: string, notifiedEmails: string[] }> {
    console.log(`Deleting creche with ID: ${id}, initiated by user: ${username}`);

    const creche = await this.crecheRepository.findOne({
      where: { id },
      relations: ['creator', 'children', 'children.creator'],
    });

    if (!creche) {
      throw new NotFoundException('Creche not found');
    }

    console.log(`Creche found: ${creche.name}, creator: ${creche.creator.username}`);

    if (creche.creator.username !== username) {
      throw new UnauthorizedException(
        'You are not authorized to delete this creche',
      );
    }

    // Get unique creator emails, excluding the initiator
    const creatorEmails = Array.from(new Set(
      creche.children
        .map(child => child.creator.email)
        .filter(email => email !== creche.creator.email)
    ));

    console.log('Emails to notify:', creatorEmails);

    const notifiedEmails: string[] = [];

    // Send emails in batches of 3
    for (let i = 0; i < creatorEmails.length; i += 3) {
      const batch = creatorEmails.slice(i, i + 3);
      console.log(`Processing batch ${Math.floor(i / 3) + 1}: ${batch.join(', ')}`);
      
      const startTime = Date.now();
      await Promise.all(batch.map(async (email) => {
        await this.informStructureDeletion(email);
        notifiedEmails.push(email);
      }));
      const endTime = Date.now();
      
      console.log(`Batch ${Math.floor(i / 3) + 1} completed in ${endTime - startTime}ms`);
    }

    // Delete the creche
    await this.crecheRepository.remove(creche);

    console.log('Creche deleted, notified emails:', notifiedEmails);

    return {
      message: `Creche "${creche.name}" has been deleted and notifications sent.`,
      notifiedEmails,
    };
  }

  private async informStructureDeletion(userEmail: string): Promise<void> {
    const secondsToWait = Math.trunc(Math.random() * 7) + 1;
    console.log(`Simulating email send to ${userEmail}, waiting ${secondsToWait} seconds...`);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`${userEmail} informed after ${secondsToWait} seconds!`);
        resolve();
      }, secondsToWait * 1000);
    });
  }

  async getChildrenInCreche(crecheId: number): Promise<Child[]> {
    try {
      const children = await this.childRepository
        .createQueryBuilder('child')
        .innerJoin('child.creches', 'creche')
        .where('creche.id = :crecheId', { crecheId })
        .getMany();

      if (children.length === 0) {
        const creche = await this.crecheRepository.findOne({
          where: { id: crecheId },
        });
        if (!creche) {
          throw new NotFoundException(`Creche with ID ${crecheId} not found`);
        }
      }

      return children;
    } catch (error) {
      console.error('Error in getChildrenInCreche service method:', error);
      throw error;
    }
  }

  async removeChildFromCreche(
    childCareId: number,
    childId: number,
    username: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creche = await this.crecheRepository.findOne({
        where: { id: childCareId },
      });
      if (!creche) {
        throw new NotFoundException(`Creche with ID ${childCareId} not found`);
      }

      const child = await this.childRepository.findOne({
        where: { id: childId },
        relations: ['creches', 'creator'],
      });
      if (!child) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }

      // Check if the user has permission to remove the child
      if (child.creator.username !== username) {
        throw new ForbiddenException(
          'You do not have permission to remove this child',
        );
      }

      // Remove the entry from child_creche table
      await queryRunner.manager.query(
        'DELETE FROM child_creche WHERE child_id = $1 AND creche_id = $2',
        [childId, childCareId],
      );

      // Check if the child is still associated with any creche
      const remainingAssociations = await queryRunner.manager.query(
        'SELECT COUNT(*) FROM child_creche WHERE child_id = $1',
        [childId],
      );

      // If the child has no more creches, delete the child
      if (parseInt(remainingAssociations[0].count) === 0) {
        await queryRunner.manager.remove(Child, child);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
