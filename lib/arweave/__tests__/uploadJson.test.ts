import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUploadToArweave = vi.hoisted(() => vi.fn());

vi.mock('../uploadToArweave', () => ({
  default: mockUploadToArweave,
}));

import { uploadJson } from '../uploadJson';

describe('uploadJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('serializes JSON and calls uploadToArweave with application/json', async () => {
    mockUploadToArweave.mockResolvedValue('ar://json-id');
    const json = { name: 'test', image: 'ar://img' };
    const result = await uploadJson(json);
    expect(result).toBe('ar://json-id');
    const [buffer, mimeType] = mockUploadToArweave.mock.calls[0];
    expect(mimeType).toBe('application/json');
    expect(JSON.parse(buffer.toString())).toEqual(json);
  });

  it('returns the URI from uploadToArweave', async () => {
    mockUploadToArweave.mockResolvedValue('ar://specific-id');
    const result = await uploadJson({ key: 'value' });
    expect(result).toBe('ar://specific-id');
  });
});
