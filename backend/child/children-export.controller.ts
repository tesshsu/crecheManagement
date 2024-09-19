import { Controller, Get, Res, Query, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ChildrenExportService } from './children-export.service';

@Controller('children')
export class ChildrenExportController {
  constructor(private readonly childrenExportService: ChildrenExportService) {}

  @Get('export.csv')
  async exportChildrenCsv(
    @Res({ passthrough: true }) res: Response,
    @Query('childCareId') childCareId?: number
  ): Promise<StreamableFile> {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="children_export.csv"',
    });

    const stream = await this.childrenExportService.generateCsvStream(childCareId);
    return new StreamableFile(stream);
  }
}