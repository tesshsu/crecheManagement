import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity';
import { User } from '../user/user.entity';
import { Creche } from '../creche/creche.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { AddChildToCrecheDto } from './dto/add-child-to-creche.dto';
import { PassThrough, Readable } from 'stream';
import * as fastcsv from 'fast-csv';

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Creche)
    private crecheRepository: Repository<Creche>,
  ) {}

  async create(firstName: string, lastName: string, username: string): Promise<Child> {
    const creator = await this.userRepository.findOne({ where: { username } });
    if (!creator) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    const child = this.childRepository.create({
      first_name: firstName,
      last_name: lastName,
      creator,
    });

    return this.childRepository.save(child);
  }

  async generateCsvStream(childCareId?: number): Promise<Readable> {
    const queryBuilder = this.childRepository
      .createQueryBuilder('child')
      .select([
        'child.id AS child_id',
        'child.first_name',
        'child.last_name',
        'child.creator_id AS child_creator_id',
      ])
      .orderBy('child.last_name', 'ASC')
      .distinct(true);

    if (childCareId) {
      queryBuilder.innerJoin(
        'child.creches',
        'creche',
        'creche.id = :childCareId',
        { childCareId },
      );
    }

    const children = await queryBuilder.getRawMany();

    const csvStream = fastcsv.format({ headers: true });

    // Writing data directly to the csvStream
    for (const child of children) {
      csvStream.write({
        ID: child.child_id,
        'First Name': child.first_name,
        'Last Name': child.last_name,
        'Creator ID': child.child_creator_id,
      });
    }
    csvStream.end();

    // Using PassThrough to directly pass the CSV stream data
    const outputStream = new PassThrough();
    csvStream.pipe(outputStream);

    return outputStream;
  }

  async addChildToCreche(addChildToCrecheDto: AddChildToCrecheDto): Promise<{ message: string; child_id: number; creche_id: number }> {
    const { child_id, creche_id } = addChildToCrecheDto;

    // Check if the child exists
    const child = await this.childRepository.findOne({ 
      where: { id: child_id },
      relations: ['creches']
    });
    if (!child) {
      throw new NotFoundException(`Child with ID ${child_id} not found`);
    }

    // Check if the creche exists
    const creche = await this.crecheRepository.findOne({ where: { id: creche_id } });
    if (!creche) {
      throw new NotFoundException(`Creche with ID ${creche_id} not found`);
    }

    // Check if the association already exists
    if (child.creches.some(c => c.id === creche_id)) {
      throw new ConflictException(`Child with ID ${child_id} is already associated with Creche ID ${creche_id}`);
    }

    // Add the creche to the child's creches
    child.creches.push(creche);

    // Save the updated child (this will update the child_creche table)
    await this.childRepository.save(child);

    // Return success message with child_id and creche_id
    return {
      message: 'Successfully added child to creche',
      child_id,
      creche_id
    };
  }

  async removeChildFromCreche(childId: number, crecheId: number): Promise<{ message: string; child_id: number; creche_id: number }> {
    // Check if the child exists
    const child = await this.childRepository.findOne({ 
      where: { id: childId },
      relations: ['creches']
    });
    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }

    // Check if the creche exists
    const creche = await this.crecheRepository.findOne({ where: { id: crecheId } });
    if (!creche) {
      throw new NotFoundException(`Creche with ID ${crecheId} not found`);
    }

    const associationExists = child.creches.some(c => c.id === crecheId);
    if (!associationExists) {
      throw new ConflictException(`Child with ID ${childId} is not associated with Creche ID ${crecheId}`);
    }

    // Remove the creche from the child's creches
    child.creches = child.creches.filter(c => c.id !== crecheId);
    
    await this.childRepository.save(child);

    return {
      message: 'Successfully removed child from creche',
      child_id: childId,
      creche_id: crecheId
    };
  }

  async createChildAddChildToCreche(
    createChildDto: CreateChildDto,
    addChildToCrecheDto: AddChildToCrecheDto,
    username: string
  ): Promise<{ message: string; child_id: number; creche_id: number }> {
    const { first_name, last_name } = createChildDto;
    const { creche_id } = addChildToCrecheDto;

    // Check if the creche exists
    const creche = await this.crecheRepository.findOne({ where: { id: creche_id } });
    if (!creche) {
      throw new NotFoundException(`Creche with ID ${creche_id} not found`);
    }

    // Find the creator (user)
    const creator = await this.userRepository.findOne({ where: { username } });
    if (!creator) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    // Create the child
    const child = this.childRepository.create({
      first_name,
      last_name,
      creator,
      creches: [creche] // Add the child to the creche immediately
    });

    // Save the child (this will also create the association in child_creche table)
    const savedChild = await this.childRepository.save(child);

    return {
      message: 'Successfully created child and added to creche',
      child_id: savedChild.id,
      creche_id
    };
  }
}