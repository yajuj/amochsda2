import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { Dto } from './dto/dto';
import { Token } from './dto/token.dto';

@Controller()
export class AppController {
  code: string;
  token: Token | null = null;
  host: string;
  constructor(private readonly appService: AppService) {}

  @Get()
  async get(@Req() req: Request, @Query('code') code: string) {
    this.host = req.headers?.host;

    try {
      const { data: token } = await this.appService.authorize(code, this.host);
      this.token = token;
    } catch (e: any) {
      console.log(e);
    }
  }

  @Post()
  async post(@Body() dto: Dto) {
    if (!this.token) throw new ForbiddenException();

    try {
      const valid = new Date().getMilliseconds() < this.token.expires_in;

      if (!valid) {
        const { data: newToken } = await this.appService.refreshToken(
          this.token.refresh_token,
          this.host,
        );
        this.token = newToken;
      }

      const {
        data: { _embedded },
      } = await this.appService.getContact(
        dto.email,
        dto.phone,
        this.token.access_token,
      );

      let contact = _embedded?.contacts[0];

      if (contact) {
        const { data } = await this.appService.updateContact(
          dto,
          contact.id,
          this.token.access_token,
        );
        contact = data;
      }

      if (!contact) {
        const { data } = await this.appService.createContact(
          dto,
          this.token.access_token,
        );
        contact = data;
      }

      await this.appService.createLead(dto, contact, this.token.access_token);
    } catch (error) {
      console.log(error.data);
    } finally {
      return;
    }
  }
}
