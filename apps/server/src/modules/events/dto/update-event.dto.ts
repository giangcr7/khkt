import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

// PartialType giúp kế thừa lại CreateEventDto nhưng biến các trường thành optional
export class UpdateEventDto extends PartialType(CreateEventDto) {}