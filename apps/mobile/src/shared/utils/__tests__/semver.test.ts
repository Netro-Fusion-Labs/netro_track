import { compareSemVer, isVersionBelow } from '../semver';

describe('semver', () => {
  it('orders versions', () => {
    expect(compareSemVer('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemVer('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareSemVer('1.1.0', '1.0.9')).toBeGreaterThan(0);
    expect(compareSemVer('2.0.0', '1.9.9')).toBeGreaterThan(0);
  });

  it('detects below minimum', () => {
    expect(isVersionBelow('1.0.0', '1.0.0')).toBe(false);
    expect(isVersionBelow('0.9.9', '1.0.0')).toBe(true);
    expect(isVersionBelow('1.1.0', '1.0.0')).toBe(false);
  });
});
