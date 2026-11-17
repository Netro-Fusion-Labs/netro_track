module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community|@maplibre/maplibre-react-native|@tanstack/react-query|react-native-mmkv|react-native-nitro-modules|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-vector-icons|react-native-image-picker|react-native-vision-camera|react-native-background-actions|zustand|socket\\.io-client|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^@netrotrack/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
