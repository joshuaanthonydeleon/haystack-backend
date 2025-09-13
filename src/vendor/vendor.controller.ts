import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN)
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      const result = await this.vendorService.processCsvFile(file);
      return {
        message: 'CSV processed successfully',
        success: result.success,
        errors: result.errors,
        totalProcessed: result.success + result.errors.length
      };
    } catch (error) {
      throw new BadRequestException(`Error processing CSV: ${error.message}`);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async getAllVendors() {
    return this.vendorService.getAllVendors();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  async getVendorById(@Param('id') id: string) {
    const vendorId = parseInt(id, 10);
    if (isNaN(vendorId)) {
      throw new BadRequestException('Invalid vendor ID');
    }
    
    const vendor = await this.vendorService.getVendorById(vendorId);
    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }
    
    return vendor;
  }
}
