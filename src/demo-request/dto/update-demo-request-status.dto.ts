import { DemoRequestStatus } from '../../entities/demo-request.entity';

export class UpdateDemoRequestStatusDto {
  status!: DemoRequestStatus;
  scheduledAt?: Date;
  completedAt?: Date;
}
