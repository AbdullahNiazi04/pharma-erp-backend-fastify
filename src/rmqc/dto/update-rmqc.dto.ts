import { PartialType } from '@nestjs/swagger';
import { CreateRmqcDto } from './create-rmqc.dto';

export class UpdateRmqcDto extends PartialType(CreateRmqcDto) {}
