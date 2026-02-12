import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectMaxCollectedAt } from '../selectMaxCollectedAt';

vi.mock('@/lib/supabase/in_process_collectors/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMax } from '@/lib/supabase/in_process_collectors/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxCollectedAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return epoch ms when selectMax returns a timestamp string', async () => {
    const isoDate = '2024-01-15T12:00:00.000Z';
    mockSelectMax.mockResolvedValue(isoDate);

    const result = await selectMaxCollectedAt();

    expect(mockSelectMax).toHaveBeenCalledWith('collected_at');
    expect(result).toBe(new Date(isoDate).getTime());
  });

  it('should return null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);

    const result = await selectMaxCollectedAt();

    expect(result).toBeNull();
  });

  it('should propagate errors from selectMax', async () => {
    mockSelectMax.mockRejectedValue(new Error('DB error'));

    await expect(selectMaxCollectedAt()).rejects.toThrow('DB error');
  });
});
