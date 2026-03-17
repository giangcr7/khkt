import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto'; 
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Public()
    @Get()
    async findAll() {
        return this.eventsService.findAll();
    }

    @Post()
    @Roles(Role.ADMIN)
    async create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
  }

    @Patch(':id')
    @Roles(Role.ADMIN)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEventDto: UpdateEventDto
    ) {
        return this.eventsService.update(id, updateEventDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.remove(id);
    }
}