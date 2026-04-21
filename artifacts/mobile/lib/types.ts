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
  vehicleMode: boolean;
  vehicleName: string;
  vehicleReg: string;
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
  biosecurityDeclarationSigned: boolean;
  healthDeclarationSigned: boolean;
  biosecuritySignature: string | null;
  healthSignature: string | null;
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
  vehicleDescription: string;
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
  locationDescription?: string;
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
  areaHarvestedHa: string;
  moisturePercent: string;
  moisturePhotoUri: string;
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

export interface FlyTippingReport {
  id: string;
  farmId: string;
  discoveredAt: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  wasteTypes: string;
  estimatedQuantity: string;
  isHazardous: boolean;
  accessPoint: string;
  policeReported: boolean;
  policeRefNumber: string;
  councilReported: boolean;
  councilRefNumber: string;
  eaReported: boolean;
  eaRefNumber: string;
  clearanceStatus: string;
  photoUris: string[];
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface EncampmentReport {
  id: string;
  farmId: string;
  discoveredAt: string;
  locationDescription: string;
  fieldId: number | null;
  fieldParcel: string;
  latitude: string;
  longitude: string;
  entryPoint: string;
  vehicleCount: string;
  personCount: string;
  caravanCount: string;
  vehicleDescriptions: string;
  landDamageDescription: string;
  cropsAffected: boolean;
  estimatedDamage: string;
  policeNotified: boolean;
  policeRefNumber: string;
  policeAction: string;
  councilNotified: boolean;
  councilRefNumber: string;
  legalActionTaken: boolean;
  legalActionDetails: string;
  solicitorInstructed: boolean;
  courtOrderObtained: boolean;
  courtOrderRef: string;
  vacatedAt: string;
  landConditionAfter: string;
  insuranceClaimMade: boolean;
  insurancePolicyId: number | null;
  insuranceClaimRef: string;
  remediationRequired: boolean;
  remediationNotes: string;
  remediationCost: string;
  photoUris: string[];
  status: string;
  notes: string;
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
  soilConditions?: string;
  weatherNotes?: string;
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
  photoUris: string[];
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
  photoUris: string[];
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

export interface AiReproductionRecord {
  id: string;
  farmId: string;
  herdName: string;
  animalId: string;
  serviceDate: string;
  method: "AI" | "natural_service" | "ET" | "synchronised_AI";
  sireId: string;
  sireBreed: string;
  sireSource: string;
  strawnBatchNumber: string;
  technicianName: string;
  expectedCalvingDate: string;
  pregnancyConfirmed: boolean;
  pregnancyCheckDate: string;
  pregnancyCheckMethod: "visual" | "rectal_palpation" | "ultrasound" | "blood_test";
  result: "confirmed_in_calf" | "not_in_calf" | "pending" | "repeat_service";
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface VetPrescription {
  id: string;
  farmId: string;
  herdName: string;
  prescribingVet: string;
  vetPracticeName: string;
  vetRcvsNumber: string;
  prescriptionDate: string;
  expiryDate: string;
  drugName: string;
  drugSpecies: string;
  dose: string;
  doseUnit: string;
  route: string;
  duration: string;
  withdrawalMeat: string;
  withdrawalMilk: string;
  quantityPrescribed: string;
  quantityUnit: string;
  prescriptionReference: string;
  clinicalReason: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface GrainQualityTest {
  id: string;
  farmId: string;
  binReference: string;
  cropType: string;
  variety: string;
  sampleDate: string;
  moisture: string;
  protein: string;
  specificWeight: string;
  hagbergFallingNumber: string;
  screenings: string;
  mycotoxinResult: string;
  testedBy: string;
  labReference: string;
  passOrFail: "pass" | "fail" | "conditional";
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface GrainTemperatureReading {
  id: string;
  farmId: string;
  binReference: string;
  readingDate: string;
  readingTime: string;
  temperatureC: string;
  sensorLocation: string;
  recordedBy: string;
  alertTriggered: boolean;
  actionTaken: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface EggProductionRecord {
  id: string;
  farmId: string;
  flockReference: string;
  house: string;
  recordDate: string;
  birdsInFlock: string;
  eggsCollected: string;
  brokenEggs: string;
  dirtyEggs: string;
  layRate: string;
  grade1: string;
  grade2: string;
  thirds: string;
  downgraded: string;
  collectedBy: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface SlurryEvent {
  id: string;
  farmId: string;
  eventDate: string;
  eventType: "spreading" | "store_fill" | "store_empty" | "analysis" | "import" | "export";
  storeReference: string;
  fieldName: string;
  applicationMethod: "splash_plate" | "trailing_shoe" | "injected" | "band_spread" | "irrigated";
  volumeM3: string;
  applicationRateM3PerHa: string;
  areaTreatedHa: string;
  contractor: string;
  nvzClosed: boolean;
  soilCondition: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface SfiAction {
  id: string;
  farmId: string;
  agreementReference: string;
  actionCode: string;
  actionName: string;
  actionDate: string;
  fieldName: string;
  areaHa: string;
  completedBy: string;
  evidenceNotes: string;
  photoTaken: boolean;
  paymentRate: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface SprayerCalibration {
  id: string;
  farmId: string;
  sprayerName: string;
  calibrationDate: string;
  calibratedBy: string;
  certificationNumber: string;
  nozzleType: string;
  nozzleSize: string;
  pressureBar: string;
  speedKmh: string;
  targetVolumePerHa: string;
  actualVolumePerHa: string;
  passOrFail: "pass" | "fail" | "advisory";
  nextCalibrationDue: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface MaintenanceLog {
  id: string;
  farmId: string;
  assetName: string;
  assetReference: string;
  maintenanceDate: string;
  maintenanceType: "mot" | "annual_service" | "interim_service" | "service" | "repair" | "inspection" | "pre_use" | "warranty" | "oil_change" | "filter_change" | "tyre" | "other";
  description: string;
  hoursAtService: string;
  labourHours: string;
  partsCost: string;
  labourCost: string;
  totalCost: string;
  technician: string;
  externalGarage: string;
  invoiceNumber: string;
  nextServiceDue: string;
  nextServiceHours: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface HorticultureRecord {
  id: string;
  farmId: string;
  activityType: "planting" | "transplanting" | "harvest" | "thinning" | "pruning" | "soil_prep" | "other";
  activityDate: string;
  cropName: string;
  variety: string;
  blockOrField: string;
  areaM2: string;
  rowsOrBeds: string;
  plantingDensity: string;
  seedLotNumber: string;
  seedSupplier: string;
  harvestWeightKg: string;
  operator: string;
  weatherConditions: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface HorticultureHarvestGrade {
  id: string;
  farmId: string;
  gradeDate: string;
  cropName: string;
  blockOrField: string;
  totalHarvestedKg: string;
  class1Kg: string;
  class2Kg: string;
  rejectedKg: string;
  rejectionReasons: string;
  packedByKg: string;
  destinationPacker: string;
  lotNumber: string;
  coldStoreReference: string;
  gradedBy: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface ColdStoreTempReading {
  id: string;
  farmId: string;
  storeReference: string;
  storeName: string;
  readingDate: string;
  readingTime: string;
  temperatureC: string;
  targetMinC: string;
  targetMaxC: string;
  alertTriggered: boolean;
  actionTaken: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface CarbonEntry {
  id: string;
  farmId: string;
  recordYear: string;
  category: "enteric_fermentation" | "manure" | "fuel_energy" | "fertiliser" | "imported_feed" | "crop_residue" | "land_use" | "waste" | "renewable_energy" | "other";
  sourceDescription: string;
  quantity: string;
  unit: string;
  emissionFactorSource: string;
  co2eKg: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface DiversificationRecord {
  id: string;
  farmId: string;
  enterprise: string;
  activityDate: string;
  activityType: "booking" | "check_in" | "check_out" | "income" | "expense" | "inspection" | "visitor_waiver" | "other";
  guestOrGroupName: string;
  numberOfGuests: string;
  amountGbp: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface EquineHealthEventRecord {
  id: string;
  farmId: string;
  horseName: string;
  eventDate: string;
  eventType: "vaccination" | "worming" | "farrier" | "dental" | "vet_visit" | "passport_check" | "other";
  vetOrFarrierName: string;
  treatmentGiven: string;
  productUsed: string;
  batchNumber: string;
  nextDueDate: string;
  cost: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface ShootingRecord {
  id: string;
  farmId: string;
  shootDate: string;
  shootType: "formal_driven" | "rough_shoot" | "walked_up" | "pigeon" | "wildfowl" | "other";
  organiser: string;
  numberOfGuns: string;
  gamekeeperName: string;
  bagsPheasant: string;
  bagsPartridge: string;
  bagsGrouse: string;
  bagsDuck: string;
  bagsWoodcock: string;
  bagsOther: string;
  totalBag: string;
  gameDealer: string;
  incomeLeaseFee: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface FoodHygieneInspectionRecord {
  id: string;
  farmId: string;
  relatesTo: string;
  inspectionDate: string;
  inspectionType: "local_authority_routine" | "allergen_compliance" | "haccp_audit" | "red_tractor" | "self_audit" | "other";
  inspectorName: string;
  inspectorOrganisation: string;
  hygieneRating: string;
  reinspectionRequired: boolean;
  reinspectionDate: string;
  findingsSummary: string;
  correctiveActions: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface StaffTrainingRecord {
  id: string;
  farmId: string;
  staffName: string;
  trainingDate: string;
  trainingType: "induction" | "refresher" | "first_aid" | "fork_lift" | "pesticide_pa1" | "pesticide_pa2" | "pesticide_pa6" | "chainsaw" | "manual_handling" | "fire_safety" | "coshh" | "other";
  courseName: string;
  trainingProvider: string;
  certificationNumber: string;
  expiryDate: string;
  assessmentResult: "pass" | "fail" | "in_progress" | "no_assessment";
  supervisor: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface CoshhAssessment {
  id: string;
  farmId: string;
  substanceName: string;
  productReference: string;
  supplier: string;
  assessmentDate: string;
  assessedBy: string;
  hazardClassification: string;
  exposureRisk: "low" | "medium" | "high";
  controlMeasures: string;
  ppeRequired: string;
  storageRequirements: string;
  disposalMethod: string;
  emergencyProcedure: string;
  reviewDate: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface AccidentReport {
  id: string;
  farmId: string;
  incidentType: "accident" | "near_miss" | "dangerous_occurrence" | "occupational_disease";
  severityLevel: "minor" | "over_3_day" | "major" | "fatal";
  incidentDate: string;
  locationDescription: string;
  descriptionOfIncident: string;
  injuredPersonName: string;
  bodyPartInjured: string;
  natureOfInjury: string;
  firstAidGiven: boolean;
  firstAidDetails: string;
  witnessNames: string;
  reportableRiddor: boolean;
  immediateActionsTaken: string;
  reportedBy: string;
  injuredPersonSignature?: string;
  photoUris: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  synced: boolean;
}

export interface HaulageConfirmation {
  id: string;
  farmId: string;
  confirmationDate: string;
  haulierName: string;
  vehicleReg: string;
  driverName: string;
  cropType: string;
  quantityTonnes: string;
  storageLocationName?: string;
  binId?: number;
  destination?: string;
  customerName?: string;
  customerRef?: string;
  dispatchNotes: string;
  confirmedBy: string;
  photoUris: string[];
  latitude?: number;
  longitude?: number;
  dispatchPlanId?: number;
  dispatchPlanRef?: string;
  driverSignature?: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryBiosecurityCleanout {
  id: string;
  farmId: string;
  houseName: string;
  cleanoutDate: string;
  flockRef: string;
  supervisedBy: string;
  litterRemoval: boolean;
  dryClean: boolean;
  prewash: boolean;
  mainWash: boolean;
  disinfectantApplied: boolean;
  disinfectantContactTimeMet: boolean;
  fumigationCarriedOut: boolean;
  verminControlChecked: boolean;
  waterSystemFlushed: boolean;
  feedSystemCleaned: boolean;
  footbathsSetUp: boolean;
  biosecuritySignsInPlace: boolean;
  changeRoomSetUp: boolean;
  eggEquipmentCleaned: boolean;
  downtime: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PigRedTractorChecklist {
  id: string;
  farmId: string;
  assessmentDate: string;
  assessedBy: string;
  animalWelfarePlan: boolean;
  medicineRecordsCompliant: boolean;
  feedRecordsComplete: boolean;
  movementRecordsComplete: boolean;
  biosecurityPlanCurrent: boolean;
  tailBitingRiskAssessment: boolean;
  enrichmentProvided: boolean;
  spaceAllowanceCompliant: boolean;
  mortalityRecordsComplete: boolean;
  waterQualityTested: boolean;
  ventilationWorking: boolean;
  temperatureMonitoring: boolean;
  beddingAdequate: boolean;
  farrowingFacilitiesCompliant: boolean;
  weanerCareDocumented: boolean;
  vetHealthPlanCurrent: boolean;
  zoonosisRiskCurrent: boolean;
  staffTrainingCurrent: boolean;
  haccp: boolean;
  notes: string;
  nonConformances: string;
  createdAt: string;
  synced: boolean;
}

export interface GrainSaleRecord {
  id: string;
  farmId: string;
  saleDate: string;
  saleType: "spot" | "forward" | "pool" | "ex-store";
  buyer: string;
  merchantRef: string;
  commodity: string;
  variety: string;
  tonnage: string;
  pricePerTonne: string;
  grossValue: string;
  deductions: string;
  netValue: string;
  moisture: string;
  specificWeight: string;
  protein: string;
  gradeAchieved: string;
  deliveryDate: string;
  deliveryLocation: string;
  weighbridgeTicket: string;
  invoiceNumber: string;
  cropYear: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface LivestockSaleRecord {
  id: string;
  farmId: string;
  saleDate: string;
  saleType: "deadweight" | "mart";
  species: string;
  headCount: string;
  processor: string;
  martName: string;
  grade: string;
  totalDeadweightKg: string;
  averageDeadweightKg: string;
  pricePerKg: string;
  grossValue: string;
  deductions: string;
  netPayment: string;
  killSheetRef: string;
  vendorDeclarationRef: string;
  animalIds: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface DirectSaleRecord {
  id: string;
  farmId: string;
  saleDate: string;
  channel: string;
  productName: string;
  productCategory: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  grossValue: string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "overdue";
  customerName: string;
  invoiceNumber: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface MilkStatementRecord {
  id: string;
  farmId: string;
  statementMonth: string;
  buyer: string;
  litresSupplied: string;
  pencePerLitre: string;
  grossValue: string;
  butterfatPct: string;
  proteinPct: string;
  scc: string;
  qualityBonus: string;
  qualityPenalty: string;
  transportDeduction: string;
  netPayment: string;
  statementRef: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface GrainStoreMovement {
  id: string;
  farmId: string;
  movementType: "transfer" | "drying_loss" | "adjustment";
  movementDate: string;
  sourceStore: string;
  destinationStore: string;
  cropType: string;
  weightTonnes: string;
  reason: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface ServiceJobRecord {
  id: string;
  farmId: string;
  jobDate: string;
  customerName: string;
  jobType: string;
  hoursWorked: string;
  equipmentUsed: string;
  rateType: "per_hour" | "per_acre" | "fixed" | "tbc";
  rateAmount: string;
  fieldOrLocation: string;
  notes: string;
  recordedBy: string;
  customerSignature?: string;
  createdAt: string;
  synced: boolean;
}

export interface PigMedicineTreatment {
  id: string;
  farmId: string;
  flockId: number;
  treatmentDate: string;
  batchOrPenRef: string;
  numberOfAnimals: string;
  medicineProductName: string;
  activeIngredient: string;
  manufacturer: string;
  productBatchNumber: string;
  expiryDate: string;
  administrationRoute: string;
  quantityUsed: string;
  unitOfMeasure: string;
  diagnosisReason: string;
  prescribingVetName: string;
  prescribingVetPractice: string;
  prescriptionObtained: boolean;
  administeredBy: string;
  withdrawalPeriodMeatDays: string;
  withdrawalEndDate: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PigMovement {
  id: string;
  farmId: string;
  movementDate: string;
  movementType: string;
  fromLocation: string;
  toLocation: string;
  fromCph: string;
  toCph: string;
  numberOfAnimals: string;
  eaml2Reference: string;
  transporterName: string;
  vehicleRegistration: string;
  cleaningDeclaration: boolean;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PigFciDocument {
  id: string;
  farmId: string;
  flockId: number;
  documentDate: string;
  batchReference: string;
  destinationAbattoir: string;
  numberOfPigs: string;
  veterinaryMedicinesLast60Days: boolean;
  medicineDetails: string;
  withdrawalPeriodClear: boolean;
  feedWithdrawalHours: string;
  lambnessCasualtyStatus: string;
  signedByFarmer: boolean;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PigFeedConsumption {
  id: string;
  farmId: string;
  flockId: number;
  consumptionDate: string;
  penName: string;
  feedType: string;
  quantityKg: string;
  batchLotNumber: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PigVetAssessment {
  id: string;
  farmId: string;
  flockId: number;
  assessmentDate: string;
  vetName: string;
  practiceName: string;
  bodyConditionScore: string;
  lameness: string;
  respiratoryHealth: string;
  skinCondition: string;
  tailBiting: string;
  mortalityRate: string;
  findings: string;
  recommendations: string;
  nextReviewDate: string;
  createdAt: string;
  synced: boolean;
}

export interface PigTailBitingRisk {
  id: string;
  farmId: string;
  flockId: number;
  assessmentDate: string;
  assessedBy: string;
  riskLevel: string;
  tailsDockedAtBirth: boolean;
  tailLengthAdequate: boolean;
  stockingDensityOk: boolean;
  enrichmentProvided: boolean;
  enrichmentTypes: string;
  feedingSystemOk: boolean;
  healthStatusOk: boolean;
  mixingFrequency: string;
  currentBiting: boolean;
  bitingLevel: string;
  interventionsTaken: string;
  monitoringFrequency: string;
  reviewDate: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryDailyMortality {
  id: string;
  farmId: string;
  flockId: number;
  flockNumber: string;
  recordDate: string;
  mortalityCount: string;
  culledCount: string;
  mainCause: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryTreatment {
  id: string;
  farmId: string;
  flockId: number;
  flockNumber: string;
  treatmentDate: string;
  numberOfBirdsTreated: string;
  productName: string;
  activeIngredient: string;
  condition: string;
  routeOfAdministration: string;
  doseRate: string;
  durationDays: string;
  batchNumber: string;
  expiryDate: string;
  administeredBy: string;
  prescribingVetName: string;
  prescribingVetPractice: string;
  prescriptionObtained: boolean;
  withdrawalPeriodDays: string;
  withdrawalClearDate: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryEnvironmentalLog {
  id: string;
  farmId: string;
  flockId: number;
  flockNumber: string;
  logDate: string;
  logTime: string;
  temperatureMin: string;
  temperatureMax: string;
  humidity: string;
  co2Ppm: string;
  ammoniaPpm: string;
  ventilationRate: string;
  lightingHours: string;
  stockingDensity: string;
  alarmActivated: boolean;
  alarmDetails: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryFciDocument {
  id: string;
  farmId: string;
  flockId: number;
  flockNumber: string;
  documentDate: string;
  catchingDate: string;
  destinationAbattoir: string;
  numberOfBirds: string;
  catchingContractor: string;
  anyDiseaseOrCondition: boolean;
  diseaseDetails: string;
  medicationsLast7Days: boolean;
  medicationDetails: string;
  withdrawalPeriodClear: boolean;
  lastFeedWithdrawalHours: string;
  signedByFarmer: boolean;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface PoultryBroilerWelfare {
  id: string;
  farmId: string;
  flockId: number;
  flockNumber: string;
  assessmentDate: string;
  assessedBy: string;
  ageAtAssessmentDays: string;
  sampleSize: string;
  footpadDermatitisScore: string;
  footpadDermatitisPercent: string;
  hockBurnScore: string;
  hockBurnPercent: string;
  gaitScore: string;
  breastBlisterPercent: string;
  plumageScore: string;
  soiledPlumagePercent: string;
  overallOutcome: string;
  actionsTaken: string;
  notes: string;
  createdAt: string;
  synced: boolean;
}

export interface ThirdPartyGrainIntakeMobile {
  id: string;
  farmId: string;
  intakeDate: string;
  customerName: string;
  lotReference: string;
  commodity: string;
  variety: string;
  quantityTonnes: string;
  moisturePercent: string;
  screeningsPercent: string;
  specificWeightKgHl: string;
  grade: string;
  deliveryNoteRef: string;
  vehicleReg: string;
  haulier: string;
  bayOrBin: string;
  transportArrangedBy: "customer" | "holding";
  notes: string;
  recordedBy: string;
  createdAt: string;
  synced: boolean;
}

export interface ThirdPartyGrainOutloadingMobile {
  id: string;
  farmId: string;
  intakeId: number | null;
  intakeLotRef: string;
  intakeCustomerName: string;
  movementDate: string;
  movementType: "outloading" | "sample" | "return" | "transfer";
  quantityTonnes: string;
  destination: string;
  vehicleReg: string;
  haulier: string;
  transportArrangedBy: "customer" | "holding";
  deliveryNoteRef: string;
  notes: string;
  recordedBy: string;
  createdAt: string;
  synced: boolean;
}
