import { Vendor } from "src/entities/vendor.entity";

export interface CsvVendorData {
  Company: string;
  'Official Website': string;
  Summary: string;
  'Detailed Description': string;
  Categories: string;
  'Target Customers': string;
  'Search Hints/Keywords': string;
  'Compliance/Certifications': string;
  'Integrations/Core Support': string;
  'Digital Banking Partners': string;
  'Notable Customers (Public)': string;
  'Pricing Notes': string;
  'Source Used (URL)': string;
  'Confidence (0-1)': string;
  'Last Verified (UTC)': string;
  Notes: string;
}

export interface VendorSearchResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}