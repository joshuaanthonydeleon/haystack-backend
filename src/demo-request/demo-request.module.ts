import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DemoRequest } from '../entities/demo-request.entity';
import { Vendor } from '../entities/vendor.entity';
import { User } from '../entities/user.entity';
import { DemoRequestService } from './demo-request.service';
import { DemoRequestController } from './demo-request.controller';

@Module({
  imports: [MikroOrmModule.forFeature([DemoRequest, Vendor, User])],
  controllers: [DemoRequestController],
  providers: [DemoRequestService],
  exports: [DemoRequestService],
})
export class DemoRequestModule {}
