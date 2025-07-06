# Esports Nexus Mobile App

React Native mobile application for the Esports Nexus platform, built with Expo.

## Features

- 🎮 Multi-game support (Valorant, BGMI, CODM, Free Fire)
- 🏆 Tournament management and participation
- 👥 Team creation and management
- 📊 Player statistics and analytics
- 🤖 AI-powered team recommendations
- 💳 Integrated payment system with Stripe
- 🔔 Push notifications
- 🔐 Biometric authentication
- 🌓 Dark/Light theme support
- 🌐 Multi-language support

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **Forms**: React Hook Form
- **API Client**: Axios
- **Authentication**: JWT with biometric support
- **Push Notifications**: Expo Notifications
- **Payment**: Stripe React Native SDK

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services and utilities
│   ├── store/          # Redux store and slices
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── constants/      # App constants and configuration
│   └── contexts/       # React contexts
├── assets/             # Images, fonts, and other assets
├── app.json           # Expo configuration
├── App.tsx            # Root component
└── package.json       # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration.

### Running the App

1. Start the Expo development server:
```bash
npm start
# or
yarn start
```

2. Run on iOS Simulator:
```bash
npm run ios
# or
yarn ios
```

3. Run on Android Emulator:
```bash
npm run android
# or
yarn android
```

4. Run on physical device:
   - Install the Expo Go app on your device
   - Scan the QR code from the terminal or Expo Dev Tools

## Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component and variable names
- Add comments for complex logic

### State Management

The app uses Redux Toolkit for state management with the following slices:
- `auth`: Authentication state
- `user`: User profile and preferences
- `tournaments`: Tournament data
- `teams`: Team management
- `games`: Game information
- `notifications`: Push notifications

### API Integration

All API calls are made through the centralized `apiClient` in `src/services/api.ts`. The client handles:
- Authentication token management
- Request/response interceptors
- Error handling
- Token refresh logic

### Navigation

The app uses React Navigation with the following structure:
- `RootNavigator`: Handles auth flow
- `AuthNavigator`: Login, Register, Forgot Password
- `MainNavigator`: Bottom tabs with nested stacks

## Building for Production

### iOS

1. Configure app.json with your Apple Developer credentials
2. Build using EAS Build:
```bash
eas build --platform ios
```

### Android

1. Configure app.json with your keystore information
2. Build using EAS Build:
```bash
eas build --platform android
```

## Testing

Run tests:
```bash
npm test
# or
yarn test
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache
```bash
expo start -c
```

2. **iOS build errors**: Clean build folder
```bash
cd ios && pod install
```

3. **Android build errors**: Clean gradle
```bash
cd android && ./gradlew clean
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is licensed under the MIT License.