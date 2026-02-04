import { PartialType } from '@nestjs/swagger';
import { CreateFinishedGoodBatchDto } from './create-finished-good-batch.dto';

export class UpdateFinishedGoodBatchDto extends PartialType(CreateFinishedGoodBatchDto) {}
