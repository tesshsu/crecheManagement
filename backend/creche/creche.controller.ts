import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CrecheService } from './creche.service';
import { Creche } from './creche.entity';
import { Child } from '../child/child.entity';
import { CrecheResponseDto } from './dto/creche-response.dto';  // Add this import

@Controller('child-care')
export class CrecheController {
  constructor(private readonly crecheService: CrecheService) {}

  @Get(':id/children')
  async getChildrenInCreche(@Param('id') id: number): Promise<Child[]> {
    try {
      const children = await this.crecheService.getChildrenInCreche(id);
      return children;
    } catch (error) {
      console.error('Error in getChildrenInCreche:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CrecheResponseDto> {
    const creche = await this.crecheService.findOne(+id);
    return new CrecheResponseDto(creche);
  }

  @Get()
  async findAll(): Promise<CrecheResponseDto[]> {
    const creches = await this.crecheService.findAll();
    return creches.map(creche => new CrecheResponseDto(creche));
  }

  @Post()
  async create(
    @Body('name') name: string,
    @Headers('X-Auth') username: string,
  ): Promise<Creche> {
    if (!username) {
      throw new UnauthorizedException('X-Auth header is required');
    }
    return this.crecheService.create(name, username);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Headers('X-Auth') username: string,
  ): Promise<void> {
    if (!username) {
      throw new UnauthorizedException('X-Auth header is required');
    }
    await this.crecheService.delete(id, username);
  }
  
  // We could also used  @UseGuards(JwtAuthGuard), hence here we use X-Auth consistency and simply
  @Delete(':childCareId/child/:childId')
  async removeChildFromCreche(
    @Param('childCareId') childCareId: number,
    @Param('childId') childId: number,
    @Headers('X-Auth') username: string
  ): Promise<void> {
    if (!username) {
      throw new UnauthorizedException('X-Auth header is required');
    }

    try {
      await this.crecheService.removeChildFromCreche(
        childCareId,
        childId,
        username,
      );
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
