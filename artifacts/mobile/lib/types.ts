export interface UserProfile {
  id: string;
  name: string;
  email: string;
  farmIds: string[];
}

export interface Farm {
  id: string;
  name: string;
  tenantSlug: string;
  sectorArable: boolean;
  sectorBeef: boolean;
  sectorDairy: boolean;
  sectorPigs: boolean;
  sectorPoultry: boolean;
}

export interface SprayRecord {
  id: string;
  farmId: string;
  fieldName: string;
  productName: string;
  applicationRate: string;
  applicationUnit: string;
  windSpeed: string;
  windDirection: string;
  temperature: string;
  humidity: string;
  pressure: string;
  operatorName: string;
  equipmentUsed: string;
  startTime: string;
  endTime: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  linkedWeatherDate: string;
  detectedFieldId: string;
  photoIds: string[];
  createdAt: string;
  synced: boolean;
}

export interface WeatherEntry {
  id: string;
  farmId: string;
  date: string;
  temperatureHigh: string;
  temperatureLow: string;
  humidity: string;
  rainfall: string;
  windSpeed: string;
  windDirection: string;
  pressure: string;
  conditions: string;
  entryMode: "manual" | "station";
  notes: string;
  latitude?: number;
  longitude?: number;
  recordedAt: string;
  createdAt: string;
  synced: boolean;
}

export interface VisitorLogEntry {
  id: string;
  farmId: string;
  visitorName: string;
  organisation: string;
  purpose: string;
  vehicleReg: string;
  timeIn: string;
  timeOut: string;
  areasVisited: string;
  biosecurityCompliant: boolean;
  signature: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface CropEvent {
  id: string;
  farmId: string;
  fieldName: string;
  eventType: "drilling" | "spraying" | "fertilising" | "harvesting" | "cultivation" | "inspection" | "other";
  date: string;
  description: string;
  operatorName: string;
  yieldAmount: string;
  yieldUnit: string;
  notes: string;
  photoIds: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface SoilSample {
  id: string;
  farmId: string;
  fieldName: string;
  sampleReference: string;
  dateTaken: string;
  sampledBy: string;
  labName: string;
  depth: string;
  ph: string;
  phosphorus: string;
  potassium: string;
  magnesium: string;
  organicMatter: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  photoIds: string[];
  createdAt: string;
  synced: boolean;
}

export interface FieldBoundary {
  id: string;
  farmId: string;
  fieldName: string;
  coordinates: { latitude: number; longitude: number }[];
  areaHectares: string;
  soilType: string;
  currentCrop: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface ComplianceForm {
  id: string;
  farmId: string;
  formType: string;
  formTitle: string;
  status: "draft" | "completed" | "submitted";
  responses: Record<string, string | boolean>;
  completedBy: string;
  completedAt: string;
  notes: string;
  photoIds: string[];
  createdAt: string;
  synced: boolean;
}

export interface PhotoRecord {
  id: string;
  farmId: string;
  uri: string;
  caption: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface MedicineRecord {
  id: string;
  farmId: string;
  herdName: string;
  animalId: string;
  medicineName: string;
  batchNumber: string;
  dosage: string;
  dosageUnit: string;
  administrationRoute: string;
  administeredBy: string;
  administeredDate: string;
  withdrawalPeriodDays: string;
  withdrawalEndDate: string;
  reason: string;
  vetName: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface LivestockCheck {
  id: string;
  farmId: string;
  herdName: string;
  checkDate: string;
  checkedBy: string;
  overallCondition: "excellent" | "good" | "fair" | "poor";
  sickCount: string;
  mortalityCount: string;
  feedOk: boolean;
  waterOk: boolean;
  shelterOk: boolean;
  actionTaken: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface LivestockMovement {
  id: string;
  farmId: string;
  herdName: string;
  species: string;
  animalCount: string;
  movementType: "on" | "off" | "between";
  fromLocation: string;
  toLocation: string;
  movementDate: string;
  movementRef: string;
  transporterName: string;
  vehicleReg: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface TransportRun {
  vehicleNumber: string;
  storageDestination: string;
  loadNotes?: string;
}

export interface HarvestRecord {
  id: string;
  farmId: string;
  fieldName: string;
  cropType: string;
  harvestDate: string;
  startTime: string;
  endTime: string;
  yieldAmount: string;
  yieldUnit: string;
  moisturePercent: string;
  grainQualityNotes: string;
  transportRuns?: TransportRun[];
  trailerVehicleNumber: string;
  storageDestination: string;
  operatorName: string;
  equipmentUsed: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface NvzApplication {
  id: string;
  farmId: string;
  fieldName: string;
  applicationDate: string;
  productName: string;
  productType: string;
  nitrogenKgHa: string;
  areaAppliedHa: string;
  applicationMethod: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface EquipmentDefect {
  id: string;
  farmId: string;
  equipmentName: string;
  reportedDate: string;
  reportedBy: string;
  defectDescription: string;
  severity: "minor" | "major" | "unsafe";
  actionTaken: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface PestControlVisit {
  id: string;
  farmId: string;
  location: string;
  visitDate: string;
  pestType: string;
  activityObserved: string;
  actionTaken: string;
  baitUsed: string;
  carriedOutBy: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface CleaningRecord {
  id: string;
  farmId: string;
  area: string;
  cleaningType: string;
  productsUsed: string;
  dilutionRate: string;
  contactTime: string;
  cleanedBy: string;
  cleanedDate: string;
  nextDueDate: string;
  verifiedBy: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface FieldInspection {
  id: string;
  farmId: string;
  fieldName: string;
  inspectionDate: string;
  cropType: string;
  growthStage: string;
  pestDiseaseObservations: string;
  actionRequired: "none" | "monitor" | "treat" | "urgent";
  recommendedAction: string;
  inspector: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface BiofuelFieldDeclaration {
  id: string;
  farmId: string;
  fieldName: string;
  landUseIn2008: string;
  convertedAfter2008: boolean;
  conversionFrom: string;
  highCarbonStockRisk: boolean;
  highBiodiversityRisk: boolean;
  eligibilityStatus: "eligible" | "not-eligible" | "requires-verification";
  declarationDate: string;
  declaredBy: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface BiofuelDeliveryRecord {
  id: string;
  farmId: string;
  deliveryDate: string;
  buyerName: string;
  buyerRtfoRef: string;
  cropType: string;
  quantityTonnes: string;
  certificationRef: string;
  sustainabilityDeclarationRef: string;
  sustainabilityScheme: string;
  ghgSavingPercent: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface HarvestTransportRecord {
  id: string;
  farmId: string;
  harvestRecordId: string;
  fieldName: string;
  cropType: string;
  vehicleNumber: string;
  storageDestination: string;
  loadNotes?: string;
  driverName: string;
  harvestDate: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: string;
  recordId: string;
  data: unknown;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
}
