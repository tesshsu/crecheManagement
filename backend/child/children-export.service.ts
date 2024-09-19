import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity';
import { Readable, PassThrough } from 'stream';
import * as fastcsv from 'fast-csv';

@Injectable()
export class ChildrenExportService {
  private readonly logger = new Logger(ChildrenExportService.name);

  constructor(
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
  ) {}

  async generateCsvStream(childCareId?: number): Promise<Readable> {
    this.logger.log(`Generating CSV stream. childCareId: ${childCareId}`);

    const queryBuilder = this.childRepository
      .createQueryBuilder('child')
      .select([
        'child.id AS child_id',
        'child.first_name AS first_name',
        'child.last_name AS last_name',
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
    
    this.logger.log(`Fetched ${children.length} children${
      childCareId ? ` for creche ${childCareId}` : ''
    }`);

    // Log the first few children to check the data
    this.logger.log('Sample data:', JSON.stringify(children.slice(0, 3), null, 2));

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

    this.logger.log('CSV stream generated successfully');

    return outputStream;
  }
}
