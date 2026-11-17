# iOS Firebase / FCM setup

1. In Firebase Console, add an iOS app with bundle id matching the Xcode target.
2. Download `GoogleService-Info.plist`.
3. Place it under `apps/mobile/ios/mobile/` and add it to the `mobile` Xcode target (Copy Bundle Resources).
4. Run `pod install` from `apps/mobile/ios`.
5. Rebuild the app.

Without this file, `@react-native-firebase/messaging` initialization fails softly and the app remains usable without push.
