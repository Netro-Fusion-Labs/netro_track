import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  assertAndroid,
  syncMobileNativeVersion,
} from '../sync-mobile-native-version.mjs';

function writeFixture(root, { version = '1.2.3', versionCode = 2, marketing = '1.0', iosBuild = 1 } = {}) {
  const pkgDir = root;
  fs.mkdirSync(path.join(pkgDir, 'android/app'), { recursive: true });
  fs.mkdirSync(path.join(pkgDir, 'ios/mobile.xcodeproj'), { recursive: true });
  fs.mkdirSync(path.join(pkgDir, 'src/shared/constants'), { recursive: true });

  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({ name: '@netrotrack/mobile', version }, null, 2),
    'utf8',
  );

  fs.writeFileSync(
    path.join(pkgDir, 'android/app/build.gradle'),
    `
android {
    defaultConfig {
        versionCode ${versionCode}
        versionName "0.0.1"
    }
}
`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(pkgDir, 'ios/mobile.xcodeproj/project.pbxproj'),
    `
/* Begin XCBuildConfiguration section */
				CURRENT_PROJECT_VERSION = ${iosBuild};
				MARKETING_VERSION = ${marketing};
				CURRENT_PROJECT_VERSION = ${iosBuild};
				MARKETING_VERSION = ${marketing};
/* End XCBuildConfiguration section */
`,
    'utf8',
  );
}

test('sync updates android, ios, and appVersion.ts then asserts match', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nt-sync-'));
  writeFixture(root, { version: '1.2.3', versionCode: 5, iosBuild: 4 });

  const result = syncMobileNativeVersion({ mobileRoot: root });
  assert.equal(result.version, '1.2.3');
  assert.equal(result.build, 6);

  const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');
  assert.match(gradle, /versionName "1\.2\.3"/);
  assert.match(gradle, /versionCode 6/);

  const pbx = fs.readFileSync(path.join(root, 'ios/mobile.xcodeproj/project.pbxproj'), 'utf8');
  assert.match(pbx, /MARKETING_VERSION = 1\.2\.3;/);
  assert.match(pbx, /CURRENT_PROJECT_VERSION = 6;/);

  const ts = fs.readFileSync(path.join(root, 'src/shared/constants/appVersion.ts'), 'utf8');
  assert.match(ts, /APP_VERSION = '1\.2\.3'/);
  assert.match(ts, /APP_BUILD = 6/);
});

test('MOBILE_VERSION_CODE override is respected', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nt-sync-'));
  writeFixture(root, { version: '2.0.0', versionCode: 1, iosBuild: 1 });
  const result = syncMobileNativeVersion({ mobileRoot: root, versionCodeEnv: '42' });
  assert.equal(result.build, 42);
});

test('assertAndroid throws on mismatch (fail-closed)', () => {
  assert.throws(
    () => assertAndroid('versionName "1.0.0"\nversionCode 1\n', '9.9.9', 1),
    /versionName mismatch/,
  );
});
