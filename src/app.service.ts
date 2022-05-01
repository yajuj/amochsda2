import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Dto } from './dto/dto';
import { Token } from './dto/token.dto';
import { AmoDto, UpdateDto } from './dto/update-dto';
import { AmoResponce, Contact } from './type/responce';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async authorize(code: string, host: string) {
    return this.httpService
      .post<Token>('oauth2/access_token', {
        client_id: process.env.AMO_INTEGRATION_ID,
        client_secret: process.env.AMO_SECRET_KEY,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://' + host,
      })
      .toPromise();
  }

  async refreshToken(token: string, host) {
    return this.httpService
      .post<Token>('oauth2/access_token', {
        client_id: process.env.AMO_INTEGRATION_ID,
        client_secret: process.env.AMO_SECRET_KEY,
        grant_type: 'refresh_token',
        refresh_token: token,
        redirect_uri: 'https://' + host + '/',
      })
      .toPromise();
  }

  async getContact(email: string, phone: string, acToken: string) {
    return this.httpService
      .get<AmoResponce>(`api/v3/contacts?query=${email}&query=${phone}`, {
        headers: {
          Authorization: `Bearer ${acToken}`,
        },
      })
      .toPromise();
  }

  async updateContact(updateDto: UpdateDto, id: number, acToken: string) {
    const data = new AmoDto(
      updateDto.name,
      updateDto.email,
      updateDto.phone,
    ).createDto();

    return this.httpService
      .patch<Contact>(
        `api/v4/contacts/${id}`,
        [
          {
            ...data,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${acToken}`,
          },
        },
      )
      .toPromise();
  }

  async createContact(dto: Dto, acToken: string) {
    const data = new AmoDto(dto.name, dto.email, dto.phone).createDto();

    return this.httpService
      .post<Contact>(
        `/api/v4/contacts`,
        [
          {
            ...data,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${acToken}`,
          },
        },
      )
      .toPromise();
  }

  async createLead(dto: Dto, contact: Contact, acToken: string) {
    console.log(
      JSON.stringify([
        {
          name: 'test',
          price: 1231,
          company_name: 'test',
          _embeded: {
            contacts: [
              {
                id: contact.id,
                name: contact.name,
                custom_fields_values: [
                  {
                    field_code: 'EMAIL',
                    values: [
                      {
                        enum_code: 'WORK',
                        value: dto.email,
                      },
                    ],
                  },
                  {
                    field_code: 'PHONE',
                    values: [
                      {
                        enum_code: 'WORK',
                        value: dto.phone,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ]),
    );
    return this.httpService
      .post(
        `/api/v4/leads`,
        [
          {
            name: 'test',
            price: 1231,
            company_name: 'test',
            _embeded: {
              contacts: [
                {
                  id: contact.id,
                  name: contact.name,
                  custom_fields_values: [
                    {
                      field_code: 'EMAIL',
                      values: [
                        {
                          enum_code: 'WORK',
                          value: dto.email,
                        },
                      ],
                    },
                    {
                      field_code: 'PHONE',
                      values: [
                        {
                          enum_code: 'WORK',
                          value: dto.phone,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${acToken}`,
          },
        },
      )
      .toPromise();
  }
}
