import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitMomentsCountUpdated } from '@/lib/socket/emitMomentsCountUpdated';

const mockEmit = vi.fn();

vi.mock('@/lib/socket/server', () => ({
  getIO: vi.fn(),
}));

import { getIO } from '@/lib/socket/server';

describe('emitMomentsCountUpdated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when io is null', () => {
    vi.mocked(getIO).mockReturnValue(null);

    emitMomentsCountUpdated();

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('emits moments:count-updated event', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    emitMomentsCountUpdated();

    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith('moments:count-updated');
  });
});
