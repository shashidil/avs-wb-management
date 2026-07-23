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
import type { Agreement } from '@weighbridge/shared';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ): Promise<Agreement[]> {
    return this.agreementsService.findAll({ clientId, status, paymentStatus });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Agreement> {
    return this.agreementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAgreementDto): Promise<Agreement> {
    return this.agreementsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgreementDto): Promise<Agreement> {
    return this.agreementsService.update(id, dto);
  }

  @Post(':id/document')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES } }))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Agreement> {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF documents are allowed');
    }
    return this.agreementsService.uploadDocument(id, file);
  }

  @Get(':id/document-url')
  async getDocumentUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.agreementsService.getDocumentUrl(id);
    return { url };
  }
}
