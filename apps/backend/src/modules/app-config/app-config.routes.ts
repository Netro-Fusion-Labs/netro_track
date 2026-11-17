import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

function readBackendVersion(): string {
  try {
    const pkgPath = join(__dirname, '../../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return process.env.npm_package_version ?? '0.0.0';
  }
}

/** Public bootstrap config for clients (no auth). */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'App config',
    data: {
      backendVersion: readBackendVersion(),
      minAppVersionAndroid: process.env.MIN_APP_VERSION_ANDROID?.trim() || '0.0.0',
      minAppVersionIos: process.env.MIN_APP_VERSION_IOS?.trim() || '0.0.0',
      androidStoreUrl: process.env.ANDROID_STORE_URL?.trim() || null,
      iosStoreUrl: process.env.IOS_STORE_URL?.trim() || null,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

export { router as appConfigRouter };
