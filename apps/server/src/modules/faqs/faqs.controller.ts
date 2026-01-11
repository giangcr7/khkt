import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Controller('faqs') // Đường dẫn API: /faqs
export class FaqsController {
    constructor(private readonly faqsService: FaqsService) { }

    @Get()
    findAll() {
        return this.faqsService.findAll();
    }

    @Post()
    create(@Body() createFaqDto: CreateFaqDto) {
        return this.faqsService.create(createFaqDto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateFaqDto: UpdateFaqDto) {
        return this.faqsService.update(id, updateFaqDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.faqsService.remove(id);
    }
}