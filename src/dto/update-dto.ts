import { PartialType } from '@nestjs/mapped-types';
import { Dto } from './dto';

export class UpdateDto extends PartialType(Dto) {
  name: string;

  email: string;

  phone: string;
}

export class AmoDto {
  constructor(
    private name: string,
    private email: string,
    private phone: string,
  ) {}

  createDto() {
    return {
      name: this.name,
      custom_fields_values: [
        {
          field_id: 598747,
          field_name: 'Телефон',
          values: [
            {
              value: this.phone,
              enum_code: 'WORK',
            },
          ],
        },
        {
          field_id: 598749,
          field_name: 'Email',
          values: [
            {
              value: this.email,
              enum_code: 'WORK',
            },
          ],
        },
      ],
    };
  }
}
