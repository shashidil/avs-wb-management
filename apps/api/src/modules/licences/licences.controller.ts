import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Licence } from '@weighbridge/shared';
import { LicencesService } from './licences.service';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

@Controller('licences')
export class LicencesController {
  constructor(private readonly licencesService: LicencesService) {}

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ): Promise<Licence[]> {
    return this.licencesService.findAll({ clientId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Licence> {
    return this.licencesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLicenceDto): Promise<Licence> {
    return this.licencesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenceDto): Promise<Licence> {
    return this.licencesService.update(id, dto);
  }

  @Post(':id/document')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES } }))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Licence> {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF documents are allowed');
    }
    return this.licencesService.uploadDocument(id, file);
  }

  @Get(':id/document-url')
  async getDocumentUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.licencesService.getDocumentUrl(id);
    return { url };
  }
}
