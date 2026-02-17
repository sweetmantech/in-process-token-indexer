import { describe, it, expect } from 'vitest';
import { toEnvioTimestamp } from '@/lib/toEnvioTimestamp';

describe('toEnvioTimestamp', () => {
  it('converts milliseconds to seconds', () => {
    expect(toEnvioTimestamp(1700000000000)).toBe(1700000000);
  });

  it('floors fractional seconds', () => {
    expect(toEnvioTimestamp(1700000000500)).toBe(1700000000);
  });

  it('defaults null to epoch 0', () => {
    expect(toEnvioTimestamp(null)).toBe(0);
  });

  it('handles zero', () => {
    expect(toEnvioTimestamp(0)).toBe(0);
  });
});
