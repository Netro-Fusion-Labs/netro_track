import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { api } from '../services/api';
import { APP_VERSION } from '../constants/appVersion';
import { isVersionBelow } from '../utils/semver';

export interface MinVersionGate {
  checking: boolean;
  blocked: boolean;
  minVersion: string;
  storeUrl: string | null;
}

interface AppConfigData {
  minAppVersionAndroid?: string;
  minAppVersionIos?: string;
  androidStoreUrl?: string | null;
  iosStoreUrl?: string | null;
}

/**
 * Fetches public app-config and reports whether this build is below the server minimum.
 */
export function useMinAppVersionGate(): MinVersionGate {
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [minVersion, setMinVersion] = useState('0.0.0');
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await api.get<{ data?: AppConfigData }>('/app-config');
        const data = res.data?.data ?? (res.data as unknown as AppConfigData);
        const min =
          Platform.OS === 'ios'
            ? data.minAppVersionIos ?? '0.0.0'
            : data.minAppVersionAndroid ?? '0.0.0';
        const url =
          Platform.OS === 'ios' ? data.iosStoreUrl ?? null : data.androidStoreUrl ?? null;
        if (cancelled) return;
        setMinVersion(min);
        setStoreUrl(url);
        setBlocked(isVersionBelow(APP_VERSION, min));
      } catch {
        // Soft-fail: allow app use if config unreachable (offline / new install).
        if (!cancelled) {
          setBlocked(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { checking, blocked, minVersion, storeUrl };
}
