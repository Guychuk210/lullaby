# Lullaby

Lullaby is a mobile application designed to help parents monitor and manage bed-wetting for children. The app connects to a specialized sensor device that detects wetness and provides real-time alerts and tracking.

## Features

- **User Authentication**: Secure login and registration system
- **Sensor Management**: Connect and manage bed-wetting sensor devices
- **Real-time Monitoring**: Get instant alerts when wetness is detected
- **History Tracking**: View and analyze bed-wetting patterns over time
- **Profile Management**: Customize user profiles and notification preferences

## Technology Stack

- **Frontend**: React Native with Expo
- **Authentication & Database**: Firebase
- **State Management**: React Context API and Hooks
- **Navigation**: React Navigation
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or Yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/lullaby.git
   cd lullaby
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Update the Firebase configuration in `src/services/firebase.ts`

4. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

5. Run on a device or emulator:
   - Scan the QR code with the Expo Go app (iOS/Android)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## Project Structure

```
lullaby/
├── src/
│   ├── components/       # Reusable UI components
│   ├── constants/        # App constants and theme
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API and Firebase services
│   ├── store/            # State management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── app.json              # Expo configuration
└── App.tsx               # App entry point
```

## Deployment

### Expo Build

```
expo build:android
expo build:ios
```

### EAS Build

```
eas build --platform android
eas build --platform ios
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/) 