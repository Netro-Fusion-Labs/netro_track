import {
  computeWorkingHours,
  isCompanyAtLocalMidnight,
} from '../services/auto-punch-out.service';

describe('auto-punch-out.service helpers', () => {
  it('computes working hours rounded to 2 decimals', () => {
    const punchIn = new Date('2026-11-17T03:00:00.000Z');
    const punchOut = new Date('2026-11-17T11:30:00.000Z');
    expect(computeWorkingHours(punchIn, punchOut)).toBe(8.5);
  });

  it('detects local midnight for a company timezone', () => {
    // 2026-11-17 00:15 in Asia/Kolkata == 2026-11-16 18:45 UTC
    const atMidnight = new Date('2026-11-16T18:45:00.000Z');
    expect(isCompanyAtLocalMidnight('Asia/Kolkata', atMidnight)).toBe(true);

    // 2026-11-17 10:00 in Asia/Kolkata == 2026-11-17 04:30 UTC
    const midday = new Date('2026-11-17T04:30:00.000Z');
    expect(isCompanyAtLocalMidnight('Asia/Kolkata', midday)).toBe(false);
  });

  it('defaults missing timezone to UTC', () => {
    const utcMidnight = new Date('2026-11-17T00:20:00.000Z');
    expect(isCompanyAtLocalMidnight(null, utcMidnight)).toBe(true);
  });
});
