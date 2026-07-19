/**
 * @file setup.ts
 * @description Jest 测试环境初始化。
 * Mock 所有 React Native 原生模块，确保测试在 Node 环境可运行。
 */

global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

Object.defineProperties(global, {
  __DEV__: {
    configurable: true,
    enumerable: true,
    value: true,
    writable: true,
  },
  cancelAnimationFrame: {
    configurable: true,
    enumerable: true,
    value(id: number) {
      return clearTimeout(id);
    },
    writable: true,
  },
  performance: {
    configurable: true,
    enumerable: true,
    value: {
      now: jest.fn(Date.now),
    },
    writable: true,
  },
  requestAnimationFrame: {
    configurable: true,
    enumerable: true,
    value(callback: (timestamp: number) => void) {
      return setTimeout(() => callback(jest.now()), 0);
    },
    writable: true,
  },
  window: {
    configurable: true,
    enumerable: true,
    value: global,
    writable: true,
  },
});

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue({ cnt: 0 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('file://test.m4a'),
      getStatusAsync: jest.fn().mockResolvedValue({
        isRecording: true,
        durationMillis: 1000,
        metering: -40,
      }),
    })),
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(undefined),
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      setOnPlaybackStatusUpdate: jest.fn(),
    })),
    AndroidOutputFormat: {
      MPEG_4: 2,
    },
    AndroidAudioEncoder: {
      AAC: 3,
    },
    IOSOutputFormat: {
      LINEARPCM: 1,
    },
    IOSAudioQuality: {
      HIGH: 1,
    },
  },
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn((cb) => cb({ setExtra: jest.fn() })),
  reactNativeTracingIntegration: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
    select: jest.fn((obj: Record<string, unknown>) => obj.ios || obj.default),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  NativeModules: {},
  processColor: jest.fn((color: string) => color),
  StyleSheet: {
    create: jest.fn((styles: Record<string, unknown>) => styles),
  },
  View: jest.fn(),
  Text: jest.fn(),
  ActivityIndicator: jest.fn(),
  TouchableOpacity: jest.fn(),
  TouchableHighlight: jest.fn(),
  ScrollView: jest.fn(),
  Image: jest.fn(),
  TextInput: jest.fn(),
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
    getInitialURL: jest.fn().mockResolvedValue(null),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
  },
  NativeEventEmitter: jest.fn(),
  EmitterSubscription: jest.fn(),
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Clipboard: {
    setString: jest.fn().mockResolvedValue(undefined),
    getString: jest.fn().mockResolvedValue(''),
  },
  ToastAndroid: {
    show: jest.fn(),
    showWithGravity: jest.fn(),
    showWithGravityAndOffset: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}));
