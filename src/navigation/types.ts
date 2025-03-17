import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Sensor: undefined;
  History: undefined;
  Profile: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  SensorSetup: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// Navigation Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 