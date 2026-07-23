import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { Client } from '@weighbridge/shared';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(@Query('search') search?: string): Promise<Client[]> {
    return this.clientsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto): Promise<Client> {
    return this.clientsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string): Promise<Client> {
    return this.clientsService.deactivate(id);
  }
}
