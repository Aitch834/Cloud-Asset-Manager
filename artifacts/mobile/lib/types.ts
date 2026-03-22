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

export interface FieldOperation {
  id: string;
  farmId: string;
  fieldName: string;
  fieldId: string;
  operationDate: string;
  operationType: string;
  implement: string;
  workingDepthCm: string;
  passes: string;
  areaHa: string;
  quantity: string;
  quantityUnit: string;
  operator: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface SoilSample {
  id: string;
  farmId: string;
  fieldId?: number;
  fieldName: string;
  sampleReference: string;
  dateTaken: string;
  sampledBy: string;
  labName: string;
  labSupplierId?: number;
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
  earTagNumbers: string;
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

export interface WasteDisposalRecord {
  id: string;
  farmId: string;
  wasteType: string;
  quantity: string;
  disposalMethod: string;
  disposalDate: string;
  carrierName: string;
  carrierLicence: string;
  destinationSite: string;
  wasteTransferNote: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface SeedDrillingRecord {
  id: string;
  farmId: string;
  fieldId?: number | null;
  fieldName?: string;
  drillingDate: string;
  cropName: string;
  variety: string;
  seedLotNumber: string;
  seedRate: string;
  seedRateUnit: string;
  isTreated: boolean;
  treatmentProduct: string;
  operator: string;
  areaSeededHa: string;
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

export interface AnimalMortality {
  id: string;
  farmId: string;
  herdName: string;
  tagNumber: string;
  species: string;
  breed: string;
  dateOfDeath: string;
  causeOfDeath: string;
  causeDetail: string;
  disposalMethod: string;
  disposalOperator: string;
  disposalRef: string;
  veterinaryAttended: boolean;
  vetName: string;
  postMortemCarriedOut: boolean;
  postMortemFindings: string;
  bcmsNotified: boolean;
  bcmsNotificationRef: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface FeedRecord {
  id: string;
  farmId: string;
  herdName: string;
  feedType: string;
  supplier: string;
  batchNumber: string;
  quantityKg: string;
  feedDate: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface WaterQualityRecord {
  id: string;
  farmId: string;
  herdId?: number;
  herdName: string;
  waterSource: string;
  testDate: string;
  testResult: string;
  testPass: boolean;
  urgentAlert?: boolean;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface EnvironmentalEvent {
  id: string;
  farmId: string;
  eventDate: string;
  eventType: string;
  featureName: string;
  description: string;
  operator: string;
  contractorUsed: boolean;
  contractorName: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}


export interface DairyCalvingRecord {
  id: string;
  farmId: string;
  cowEarTag: string;
  calvingDate: string;
  calvingEaseScore: string;
  numberOfCalves: number;
  calfOutcome: string;
  calfSex: string;
  calfEarTag: string;
  assistanceRequired: boolean;
  vetAttended: boolean;
  vetName: string;
  colostrumGivenWithin2Hours: boolean;
  colostrumGivenWithin6Hours: boolean;
  colostrumVolumeFirstFeedLitres: string;
  colostrumSource: string;
  cowComplications: string;
  calfDisposition: string;
  bcmsPassportApplied: boolean;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  synced: boolean;
}

export interface DairyMastitisRecord {
  id: string;
  farmId: string;
  cowEarTag: string;
  onsetDate: string;
  quartersAffected: string;
  clinicalGrade: string;
  treatmentProduct: string;
  treatmentStartDate: string;
  treatmentDurationDays: string;
  vetConsulted: boolean;
  vetName: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  synced: boolean;
}

export interface DairyBcsRecord {
  id: string;
  farmId: string;
  cowEarTag: string;
  assessmentDate: string;
  lifeStage: string;
  bcsScore: string;
  assessedBy: string;
  targetScore: string;
  actionRequired: boolean;
  actionTaken: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface DairyMobilityScoring {
  id: string;
  farmId: string;
  assessmentDate: string;
  assessedBy: string;
  totalCowsScored: number;
  score0Count: number;
  score1Count: number;
  score2Count: number;
  score3Count: number;
  actionTaken: string;
  nextAssessmentDue: string;
  notes: string;
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

export interface PoultryWelfareCheck {
  id: string;
  farmId: string;
  houseName: string;
  flockId: string;
  checkedBy: string;
  checkDate: string;
  ambientTempC: string;
  ventilationOk: boolean;
  lightingOk: boolean;
  feedOk: boolean;
  waterOk: boolean;
  litterCondition: "good" | "fair" | "poor" | "action-needed";
  birdBehaviour: "normal" | "dull" | "distressed";
  dailyMortalities: string;
  sickInjuredCount: string;
  ammoniaLevel: "none" | "low" | "moderate" | "high";
  overallWelfare: "pass" | "advisory" | "fail";
  actionTaken: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface PigWelfareCheck {
  id: string;
  farmId: string;
  groupName: string;
  pigsInGroup: string;
  checkedBy: string;
  checkDate: string;
  behaviour: "normal" | "lethargic" | "distressed";
  ventilationOk: boolean;
  feedOk: boolean;
  waterOk: boolean;
  beddingCondition: "clean" | "damp" | "wet" | "fouled";
  tailBitingObserved: boolean;
  aggression: boolean;
  sickInjuredCount: string;
  mortalityCount: string;
  overallWelfare: "pass" | "advisory" | "fail";
  actionTaken: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface RightToWorkCheck {
  id: string;
  farmId: string;
  workerName: string;
  documentList: "A" | "B";
  documentType: string;
  documentReference: string;
  checkDate: string;
  checkedBy: string;
  expiryDate: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface IrrigationMeterReading {
  id: string;
  farmId: string;
  sourceName: string;
  meterReference: string;
  readingDate: string;
  readingM3: string;
  previousReadingM3: string;
  usageSinceLast: string;
  recordedBy: string;
  pumpCondition: "ok" | "advisory" | "fault";
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface PigFarrowingRecord {
  id: string;
  farmId: string;
  sowId: string;
  farrowingDate: string;
  totalBorn: string;
  bornAlive: string;
  stillborn: string;
  mummified: string;
  averageBirthWeightKg: string;
  farrowingEase: "easy" | "assisted" | "difficult" | "caesarean";
  colostrum: boolean;
  sowConditionScore: "1" | "2" | "3" | "4" | "5";
  attendedBy: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface PoultryThinningRecord {
  id: string;
  farmId: string;
  flockReference: string;
  thinningNumber: "1st" | "2nd" | "3rd" | "Final depletion";
  thinningDate: string;
  birdsRemoved: string;
  targetWeightKg: string;
  actualAvgWeightKg: string;
  destinationAbattoir: string;
  catchingContractor: string;
  catchingStartTime: string;
  catchingEndTime: string;
  vehicleReg: string;
  doaAtLoading: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
}
