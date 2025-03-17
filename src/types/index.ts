// User related types
export interface User {
  id: string;
  email: string | null;
  displayName?: string;
  createdAt: number | any; // Allow Firebase FieldValue
}

// Authentication related types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Sensor related types
export interface SensorData {
  id: string;
  deviceId?: string;
  timestamp: number;
  isWet: boolean;
  batteryLevel?: number;
  recordedAt?: any; // Allow Firebase FieldValue
}

export interface SensorDevice {
  id: string;
  name: string;
  userId?: string;
  isConnected: boolean;
  batteryLevel: number;
  lastSyncTime: number;
  createdAt?: any; // Allow Firebase FieldValue
}

export interface SensorState {
  device: SensorDevice | null;
  data: SensorData[];
  isLoading: boolean;
  error: string | null;
}
