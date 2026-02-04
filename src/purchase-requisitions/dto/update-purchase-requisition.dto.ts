import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseRequisitionDto } from './create-purchase-requisition.dto';

export class UpdatePurchaseRequisitionDto extends PartialType(CreatePurchaseRequisitionDto) {}
