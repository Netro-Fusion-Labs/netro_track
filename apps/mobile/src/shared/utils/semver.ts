/**
 * Compare SemVer-ish marketing versions (major.minor.patch, optional pre-release ignored for min checks).
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareSemVer(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function isVersionBelow(current: string, minimum: string): boolean {
  return compareSemVer(current, minimum) < 0;
}

function parse(input: string): [number, number, number] {
  const core = input.trim().split('-')[0] ?? '0.0.0';
  const parts = core.split('.').map((p) => Number.parseInt(p, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}
