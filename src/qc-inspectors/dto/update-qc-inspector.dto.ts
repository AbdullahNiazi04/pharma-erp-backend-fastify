import { PartialType } from '@nestjs/swagger';
import { CreateQcInspectorDto } from './create-qc-inspector.dto';

export class UpdateQcInspectorDto extends PartialType(CreateQcInspectorDto) {}
