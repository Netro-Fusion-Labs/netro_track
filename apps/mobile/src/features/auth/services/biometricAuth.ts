import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { storage } from '../../../shared/utils/storage';

const BIOMETRIC_ENABLED_KEY = 'netrotrack_biometric_enabled';
const BIOMETRIC_PROMPT = 'Unlock NetroTrack';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

export type BiometricAvailability = {
  available: boolean;
  biometryType: string | null;
};

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return {
      available: Boolean(available),
      biometryType: biometryType ?? null,
    };
  } catch {
    return { available: false, biometryType: null };
  }
}

export function isBiometricUnlockEnabled(): boolean {
  return storage.getBoolean(BIOMETRIC_ENABLED_KEY) === true;
}

export function setBiometricUnlockEnabled(enabled: boolean): void {
  storage.set(BIOMETRIC_ENABLED_KEY, enabled);
}

export function biometricLabel(biometryType: string | null): string {
  if (biometryType === BiometryTypes.FaceID) return 'Face ID';
  if (biometryType === BiometryTypes.TouchID) return 'Touch ID';
  if (biometryType === BiometryTypes.Biometrics) return 'Biometrics';
  return 'Biometric unlock';
}

/**
 * Prompt system biometrics. Returns true only on successful authentication.
 */
export async function authenticateWithBiometrics(
  promptMessage: string = BIOMETRIC_PROMPT,
): Promise<boolean> {
  try {
    const { available } = await getBiometricAvailability();
    if (!available) return false;
    const { success } = await rnBiometrics.simplePrompt({ promptMessage });
    return success === true;
  } catch {
    return false;
  }
}

/**
 * After a successful MPIN setup/verify, offer opt-in biometric unlock once.
 */
export async function offerBiometricOptIn(): Promise<void> {
  if (isBiometricUnlockEnabled()) return;
  const { available, biometryType } = await getBiometricAvailability();
  if (!available) return;

  const { Alert } = await import('react-native');
  const label = biometricLabel(biometryType);
  Alert.alert(
    `Enable ${label}?`,
    `Use ${label} for faster unlock next time. You can still use your MPIN anytime.`,
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Enable',
        onPress: () => setBiometricUnlockEnabled(true),
      },
    ],
  );
}
