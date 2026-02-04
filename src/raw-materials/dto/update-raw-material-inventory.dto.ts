import { PartialType } from '@nestjs/swagger';
import { CreateRawMaterialInventoryDto } from './create-raw-material-inventory.dto';

export class UpdateRawMaterialInventoryDto extends PartialType(CreateRawMaterialInventoryDto) {}
