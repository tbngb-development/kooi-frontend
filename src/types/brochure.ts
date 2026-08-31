export interface BrochureSummary {
  id: string;
  projectName: string | null;
  developerName: string | null;
  city: string | null;
  area: string | null;
  configurations: string[];
  constructionStatus: string | null;
  confidence: number;
  isConfirmed: boolean;
  originalFileName: string;
  createdAt: string;
  campaigns: { id: string }[];
}

export interface Brochure {
  id: string;
  tenantId: string;
  originalFileName: string;
  fileSizeMB: string;
  pageCount: number;
  rawTextLength: number;
  projectName?: string | null;
  developerName?: string | null;
  reraNumber?: string | null;
  projectWebsite?: string | null;
  contactNumber?: string | null;
  city?: string | null;
  area?: string | null;
  state?: string | null;
  landmark?: string | null;
  fullAddress?: string | null;
  propertyTypes: string[];
  configurations: string[];
  totalUnits?: number | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  sizeMin?: number | null;
  sizeMax?: number | null;
  sizeUnit?: string | null;
  startingPrice?: number | null;
  maxPrice?: number | null;
  pricePerSqft?: number | null;
  priceLabel?: string | null;
  paymentPlan?: string | null;
  bankApprovals: string[];
  maintenanceCharge?: string | null;
  possessionDate?: string | null;
  launchDate?: string | null;
  constructionStatus?: string | null;
  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];
  minimumBudget?: number | null;
  maximumBudget?: number | null;
  targetBuyerProfile?: string | null;
  preferredLocations: string[];
  investmentType: string[];
  keyQualifyingQuestions: string[];
  confidence: number;
  extractionWarnings: string[];
  isConfirmed: boolean;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  campaigns: { id: string; name: string; status: string }[];
}

export interface PropertyDetails {
  projectName: string | null;
  developerName: string | null;
  reraNumber: string | null;
  projectWebsite: string | null;
  contactNumber: string | null;
  location: {
    city: string | null;
    area: string | null;
    state: string | null;
    landmark: string | null;
    fullAddress: string | null;
  };
  propertyTypes: string[];
  configurations: string[];
  totalUnits: number | null;
  totalTowers: number | null;
  totalFloors: number | null;
  sizeRange: { min: number | null; max: number | null; unit: string | null };
  pricing: {
    startingPrice: number | null;
    maxPrice: number | null;
    pricePerSqft: number | null;
    currency: string;
    priceLabel: string | null;
  };
  paymentPlan: string | null;
  bankApprovals: string[];
  maintenanceCharge: string | null;
  possessionDate: string | null;
  launchDate: string | null;
  constructionStatus: string;
  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];
  qualificationCriteria: {
    minimumBudget: number | null;
    maximumBudget: number | null;
    targetBuyerProfile: string | null;
    preferredLocations: string[];
    investmentType: string[];
    keyQualifyingQuestions: string[];
  };
  confidence: number;
  extractionWarnings: string[];
  rawTextLength: number;
}

export interface FlattenedBrochure {
  originalFileName: string;
  fileSizeMB: string;
  pageCount: number;
  rawTextLength: number;
  projectName?: string | null;
  developerName?: string | null;
  reraNumber?: string | null;
  projectWebsite?: string | null;
  contactNumber?: string | null;
  city?: string | null;
  area?: string | null;
  state?: string | null;
  landmark?: string | null;
  fullAddress?: string | null;
  propertyTypes: string[];
  configurations: string[];
  totalUnits?: number | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  sizeMin?: number | null;
  sizeMax?: number | null;
  sizeUnit?: string | null;
  startingPrice?: number | null;
  maxPrice?: number | null;
  pricePerSqft?: number | null;
  priceLabel?: string | null;
  paymentPlan?: string | null;
  bankApprovals: string[];
  maintenanceCharge?: string | null;
  possessionDate?: string | null;
  launchDate?: string | null;
  constructionStatus?: string;
  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];
  minimumBudget?: number | null;
  maximumBudget?: number | null;
  targetBuyerProfile?: string | null;
  preferredLocations: string[];
  investmentType: string[];
  keyQualifyingQuestions: string[];
  confidence: number;
  extractionWarnings: string[];
}

export interface BrochureExtractionResult {
  propertyDetails: PropertyDetails;
  flattenedForSave: FlattenedBrochure;
  pdfMeta: {
    fileName: string;
    pageCount: number;
    fileSizeBytes: number;
    fileSizeMB: string;
    textLength: number;
    truncated: boolean;
    extractedAt: string;
  };
  textQuality: {
    hasUsableText: boolean;
    avgCharsPerPage?: number;
    warning?: string | null;
  };
}
