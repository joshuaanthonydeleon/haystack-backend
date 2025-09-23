import { DemoRequestStatus } from '../../entities/demo-request.entity';

export class CreateDemoRequestDto {
  vendorId!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone?: string;
  bankName!: string;
  title!: string;
  assetsUnderManagement!: string;
  currentProvider?: string;
  timeline!: string;
  preferredTime!: string;
  message?: string;
  status?: DemoRequestStatus;
  scheduledAt?: Date;
  completedAt?: Date;
}
