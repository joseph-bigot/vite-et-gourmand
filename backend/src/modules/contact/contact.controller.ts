import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { ContactDto } from './dto/contact.dto.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  envoyerMessage(@Body() donnees: ContactDto) {
    return this.contactService.envoyerMessage(donnees);
  }
}
