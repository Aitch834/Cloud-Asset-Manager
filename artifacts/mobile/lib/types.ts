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
