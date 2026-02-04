import { PartialType } from '@nestjs/swagger';
import { CreateRawMaterialBatchDto } from './create-raw-material-batch.dto';

export class UpdateRawMaterialBatchDto extends PartialType(CreateRawMaterialBatchDto) {}
