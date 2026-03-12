import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapMetadataToSupabase } from '@/lib/moments/mapMetadataToSupabase';

vi.mock('@/lib/moments/fetchMetadata');
import { fetchMetadata } from '@/lib/moments/fetchMetadata';

const mockMetadata = {
  name: 'Test Moment',
  description: 'A test description',
  image: 'ipfs://image-hash',
  animation_url: 'ipfs://animation-hash',
  external_url: 'https://example.com',
  content: { mime: 'video/mp4', uri: 'ipfs://content-hash' },
};

const okResponse = () =>
  new Response(JSON.stringify(mockMetadata), { status: 200 });

describe('mapMetadataToSupabase', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty array when given no moments', async () => {
    const result = await mapMetadataToSupabase([]);
    expect(result).toEqual([]);
  });

  it('maps fetched metadata to supabase insert format', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(okResponse());

    const result = await mapMetadataToSupabase([
      { id: 'moment-uuid', uri: 'ipfs://test' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      moment: 'moment-uuid',
      name: mockMetadata.name,
      description: mockMetadata.description,
      image: mockMetadata.image,
      animation_url: mockMetadata.animation_url,
      external_url: mockMetadata.external_url,
      content: mockMetadata.content,
    });
  });

  it('sets missing optional fields to null', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(
      new Response(JSON.stringify({ name: 'Minimal' }), { status: 200 })
    );

    const result = await mapMetadataToSupabase([
      { id: 'moment-uuid', uri: 'ipfs://test' },
    ]);

    expect(result[0]).toMatchObject({
      moment: 'moment-uuid',
      name: 'Minimal',
      description: null,
      image: null,
      animation_url: null,
      external_url: null,
      content: null,
    });
  });

  it('skips moment when fetch response is not ok', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(
      new Response('error', { status: 500 })
    );

    const result = await mapMetadataToSupabase([
      { id: 'moment-uuid', uri: 'ipfs://test' },
    ]);

    expect(result).toHaveLength(0);
  });

  it('skips moment when fetch throws', async () => {
    vi.mocked(fetchMetadata).mockRejectedValue(new Error('network error'));

    const result = await mapMetadataToSupabase([
      { id: 'moment-uuid', uri: 'ipfs://test' },
    ]);

    expect(result).toHaveLength(0);
  });

  it('processes multiple moments in parallel', async () => {
    vi.mocked(fetchMetadata).mockImplementation(() =>
      Promise.resolve(okResponse())
    );

    const moments = [
      { id: 'uuid-1', uri: 'ipfs://test-1' },
      { id: 'uuid-2', uri: 'ipfs://test-2' },
      { id: 'uuid-3', uri: 'ipfs://test-3' },
    ];

    const result = await mapMetadataToSupabase(moments);

    expect(result).toHaveLength(3);
    expect(fetchMetadata).toHaveBeenCalledTimes(3);
  });
});
