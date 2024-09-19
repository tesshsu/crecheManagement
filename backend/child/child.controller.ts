import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { ChildService } from './child.service';
import { ChildrenExportService } from './children-export.service';
import { Child } from './child.entity';

import { AddChildToCrecheDto } from './dto/add-child-to-creche.dto';
import { CreateChildDto } from './dto/create-child.dto';

@Controller('child')
export class ChildController {
  private readonly logger = new Logger(ChildController.name);
  constructor(
    private readonly childService: ChildService,
    private readonly childrenExportService: ChildrenExportService // Inject ChildrenExportService
  ) {}

  @Get()
  async test() {
    return { message: 'Child controller is working' };
  }

  @Post()
  async create(
    @Body('first_name') firstName: string,
    @Body('last_name') lastName: string,
    @Headers('X-Auth') username: string,
  ): Promise<Child> {
    if (!username) {
      throw new UnauthorizedException('X-Auth header is required');
    }
    return this.childService.create(firstName, lastName, username);
  }

  // Add the new route for adding a child to a crèche
  @Post('addToCreche')
  async addChildToCreche(@Body() addChildToCrecheDto: AddChildToCrecheDto): Promise<{ message: string; child_id: number; creche_id: number }> {
    return await this.childService.addChildToCreche(addChildToCrecheDto);
  }

  @Delete('removeFromCreche')
  async removeChildFromCreche(
    @Query('child_id', ParseIntPipe) childId: number,
    @Query('creche_id', ParseIntPipe) crecheId: number
  ): Promise<{ message: string; child_id: number; creche_id: number }> {
    return await this.childService.removeChildFromCreche(childId, crecheId);
  }

  // New method for creating a child and adding to a crèche
  @Post('createAndAddToCreche')
  async createChildAddChildToCreche(
    @Body('child') createChildDto: CreateChildDto,
    @Body('creche') addChildToCrecheDto: AddChildToCrecheDto,
    @Headers('X-Auth') username: string,
  ): Promise<{ message: string; child_id: number; creche_id: number }> {
    if (!username) {
      throw new UnauthorizedException('X-Auth header is required');
    }
    return this.childService.createChildAddChildToCreche(createChildDto, addChildToCrecheDto, username);
  }
}