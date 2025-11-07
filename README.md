# React Native Foundation

A ready-made, reusable Expo React Native foundation repository with fundamental setup and essential libraries for rapid mobile app development.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Core Libraries](#core-libraries)
- [Additional Libraries](#additional-libraries)
- [Third-Party Service SDKs](#third-party-service-sdks)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

This foundation repository provides a comprehensive starting point for Expo React Native applications, pre-configured with essential libraries and tools commonly used in production mobile apps.

**Current Versions:**
- React: 19.1.0
- React Native: 0.81.5
- Expo SDK: ~54.0

## Features

✅ **Navigation** - Complete navigation setup  
✅ **State Management** - Redux Toolkit integration  
✅ **Database** - Local storage solutions  
✅ **UI Components** - Material Design components  
✅ **Animations** - Smooth animations and gestures  
✅ **Networking** - HTTP client configuration  
✅ **Notifications** - Push notification support  
✅ **Localization** - Multi-language support  
✅ **Security** - Encrypted storage  
✅ **Performance** - Optimized list rendering  

## Getting Started

### Prerequisites

- Node.js (>= 18.x)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app (for testing on physical devices)
- Xcode (for iOS development and simulators)
- Android Studio (for Android development and emulators)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Icebeer7/react-native-foundation.git
cd react-native-foundation
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the Expo development server:
```bash
npx expo start
# or
yarn expo start
```

4. Run on specific platforms:
```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web browser
npx expo start --web
```

## Core Libraries

### 🧭 Navigation
- **expo-router** - File-based routing for Expo apps
- **@react-navigation/drawer** - Drawer navigation for expo-router
- **@react-navigation/native** - Navigation library for React Native

### 💾 Database & Storage
- **@nozbe/watermelondb** - High-performance reactive database built on SQLite
- **expo-sqlite** - SQLite database for Expo
- **@react-native-async-storage/async-storage** - Asynchronous storage
- **expo-secure-store** - Secure storage for sensitive data

### 🎨 UI & Theming
- **react-native-svg** - SVG support for React Native
- **react-native-linear-gradient** - Linear gradient component
- **react-native-shimmer-placeholder** - Shimmer placeholder effects
- **react-native-fast-shadow** - Fast shadow implementation
- **@gorhom/bottom-sheet** - High-performance bottom sheet component
- **@react-native-community/blur** - Blur effects for React Native

### 🎯 Gestures & Animation
- **react-native-gesture-handler** - Gesture recognition
- **react-native-reanimated** - High-performance animations
- **react-native-screens** - Native navigation primitives
- **react-native-safe-area-context** - Safe area utilities
- **react-native-redash** - Utility library for react-native-reanimated
- **lottie-react-native** - Lottie animations for React Native
- **react-native-keyboard-controller** - Keyboard management and animations

### 🗂️ State Management
- **@reduxjs/toolkit** - Modern Redux toolkit
- **react-redux** - React bindings for Redux
- **redux** - Predictable state container
- **redux-logger** - Redux action logger for development

### 🔔 Notifications
- **expo-notifications** - Push and local notifications for Expo

### 🌐 Localization
- **i18next** - Internationalization framework
- **react-i18next** - React integration for i18next
- **react-native-localize** - Device locale information
- **intl-pluralrules** - Polyfill for Intl.PluralRules
- **i18next-intervalplural-postprocessor** - Interval plurals support for i18next

### 🌍 Networking
- **axios** - HTTP client for API requests

### ⚡ Performance
- **@shopify/flash-list** - Optimized list component for large datasets
- **expo-task-manager** - Background task execution
- **react-native-worklets** - High-performance JavaScript worklets for threading

## Additional Libraries

### 📡 Network & Connectivity
- **@react-native-community/netinfo** - Network state monitoring

### 📝 Forms & Validation
- **formik** - Form library
- **yup** - Schema validation
- **react-native-picker-select** - Customizable picker component for forms

### 🛠️ Utilities
- **dayjs** - Lightweight date library
- **uuid** - Generate unique identifiers
- **react-native-get-random-values** - Polyfill for crypto.getRandomValues
- **react-native-url-polyfill** - URL polyfill for React Native
- **@react-native-community/hooks** - Common React Native hooks collection

### 🎯 Device & System
- **react-native-device-info** - Device information
- **react-native-toast-message** - Toast notifications
- **react-native-system-navigation-bar** - System navigation bar customization

### 📍 Location Services
- **expo-location** - Location services for Expo
- **react-native-community/geolocation** - Geocoding services

### 🎨 Media & Graphics
- **react-native-svg** - SVG support for React Native
- **expo-image** - Optimized image component
- **@d11/react-native-fast-image** - Fast and performant image component

### 🚀 App Lifecycle
- **expo-splash-screen** - Splash screen management for Expo

### 🔐 Permissions & Security
- **expo-permissions** - Runtime permissions for Expo
- **expo-crypto** - Cryptographic operations
- **react-native-keychain** - Secure keychain storage for sensitive data
- **react-native-aes-crypto** - AES encryption/decryption library

### 📧 Communication
- **expo-mail-composer** - Email functionality for Expo

### 📸 Camera & Scanning
- **expo-camera** - Camera integration for Expo
- **expo-barcode-scanner** - QR code and barcode scanning

### 📊 Analytics & Monitoring
- **expo-analytics** - Analytics for Expo apps
- **expo-tracking-transparency** - App tracking transparency (iOS)

## Project Structure

```
react-native-foundation/
├── app/                              # Application screens (Expo Router)
│   ├── (tabs)/                       # Tab-based navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── two.tsx
│   ├── _layout.tsx                  # Root layout
│   ├── modal.tsx
│   └── +not-found.tsx
├── assets/                           # Static assets
│   ├── fonts/                       # Custom fonts
│   ├── images/                      # Images and icons
│   └── locales/                     # i18n translation files (en, es, fr, de, it, ja, zh, pt-BR)
├── components/                       # Reusable UI components
│   ├── __tests__/                   # Component tests
│   ├── Themed.tsx
│   ├── StyledText.tsx
│   └── ...                          # Other components and hooks
├── constants/                        # App-wide constants
│   └── Colors.ts
├── src/
│   ├── state/                       # State management types
│   ├── store/                       # Redux store & slices
│   │   ├── slices/
│   │   └── store.ts
│   ├── theme/                       # Theme system
│   │   ├── Theme.context.tsx
│   │   ├── Theme.interface.ts
│   │   └── ...
│   └── utils/                       # Utility functions
│       ├── observables/             # Observable patterns
│       ├── watermelondb/            # Database setup & models
│       ├── *Utils.ts                # Array, Color, Crypto, DateTime, Math, Network, String utils
│       ├── KeyValueStorage.ts       # Storage utilities
│       └── ToastConfig.tsx
├── scripts/                          # Build and deployment scripts
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

## Usage

This foundation provides a solid starting point for your Expo React Native project. You can:

1. **Start developing** immediately with pre-configured Expo libraries
2. **Test on devices** using Expo Go app for rapid development
3. **Build and deploy** using EAS Build and EAS Submit
4. **Customize** the setup according to your project needs
5. **Add or remove** libraries based on your requirements
6. **Follow** the established patterns for consistency

### Development Workflow

- **Development**: Use `npx expo start` for local development
- **Testing**: Test on physical devices with Expo Go or simulators/emulators
- **Building**: Use EAS Build for production builds
- **Publishing**: Use EAS Submit for app store deployments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
