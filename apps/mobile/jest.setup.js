/* global jest */

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      getString: (key) => (store.has(key) ? store.get(key) : undefined),
      set: (key, value) => {
        store.set(key, String(value));
      },
      remove: (key) => {
        store.delete(key);
      },
      clearAll: () => {
        store.clear();
      },
      contains: (key) => store.has(key),
    }),
    MMKV: jest.fn(),
  };
});

jest.mock('@maplibre/maplibre-react-native', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
  PointAnnotation: 'PointAnnotation',
  ShapeSource: 'ShapeSource',
  LineLayer: 'LineLayer',
  setAccessToken: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: { latitude: 0, longitude: 0, accuracy: 10 },
        timestamp: Date.now(),
      }),
    ),
    watchPosition: jest.fn(() => 1),
    clearWatch: jest.fn(),
    setRNConfiguration: jest.fn(),
    requestAuthorization: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({ isConnected: true, isInternetReachable: true }),
    ),
  },
}));

jest.mock(
  '@react-native-async-storage/async-storage',
  () => {
    const store = new Map();
    return {
      __esModule: true,
      default: {
        setItem: jest.fn(async (k, v) => {
          store.set(k, v);
        }),
        getItem: jest.fn(async (k) => (store.has(k) ? store.get(k) : null)),
        removeItem: jest.fn(async (k) => {
          store.delete(k);
        }),
        clear: jest.fn(async () => {
          store.clear();
        }),
      },
    };
  },
  { virtual: true },
);

jest.mock(
  '@react-native-firebase/messaging',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({
      requestPermission: jest.fn(async () => 1),
      getToken: jest.fn(async () => 'test-fcm-token'),
      onTokenRefresh: jest.fn(() => jest.fn()),
      onMessage: jest.fn(() => jest.fn()),
      onNotificationOpenedApp: jest.fn(() => jest.fn()),
      getInitialNotification: jest.fn(async () => null),
      setBackgroundMessageHandler: jest.fn(),
    })),
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
  }),
  { virtual: true },
);

jest.mock(
  '@react-native-firebase/app',
  () => ({
    __esModule: true,
    default: { apps: [] },
  }),
  { virtual: true },
);

jest.mock('react-native-background-actions', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: jest.fn(() => false),
    updateNotification: jest.fn(),
  },
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(),
  })),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    gestureHandlerRootHOC: (c) => c,
    Directions: {},
  };
});

jest.mock('./src/shared/utils/syncEngine', () => ({
  startSyncEngine: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = (props) => React.createElement(View, props);
  return new Proxy(
    {},
    {
      get: () => Icon,
    },
  );
});

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));
