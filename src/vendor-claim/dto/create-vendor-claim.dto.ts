import { VerificationMethod } from '../../entities/vendor-claim.entity';

export class CreateVendorClaimDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  title!: string;
  companyEmail!: string;
  verificationMethod!: VerificationMethod;
  message?: string;
}
