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
  artist: 'Test Artist',
};

const makeMoment = (id: string, creator = '0xabc') => ({
  id,
  uri: `ipfs://${id}`,
  collection: { creator },
});

const okResponse = (data = mockMetadata) =>
  new Response(JSON.stringify(data), { status: 200 });

describe('mapMetadataToSupabase', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty results when given no moments', async () => {
    const result = await mapMetadataToSupabase([]);
    expect(result).toEqual({ records: [], artistNamesByAddresses: new Map() });
  });

  it('maps fetched metadata to supabase insert format', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(okResponse());

    const { records } = await mapMetadataToSupabase([
      makeMoment('moment-uuid'),
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
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
      okResponse({ name: 'Minimal' } as any)
    );

    const { records } = await mapMetadataToSupabase([
      makeMoment('moment-uuid'),
    ]);

    expect(records[0]).toMatchObject({
      moment: 'moment-uuid',
      name: 'Minimal',
      description: null,
      image: null,
      animation_url: null,
      external_url: null,
      content: null,
    });
  });

  it('populates artistNamesByAddresses from metadata.artist', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(okResponse());

    const { artistNamesByAddresses } = await mapMetadataToSupabase([
      makeMoment('moment-uuid', '0xcreator'),
    ]);

    expect(artistNamesByAddresses.get('0xcreator')).toBe('Test Artist');
  });

  it('does not set artist entry when metadata has no artist field', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(
      okResponse({ name: 'No Artist' } as any)
    );

    const { artistNamesByAddresses } = await mapMetadataToSupabase([
      makeMoment('moment-uuid', '0xcreator'),
    ]);

    expect(artistNamesByAddresses.size).toBe(0);
  });

  it('skips moment when fetch response is not ok', async () => {
    vi.mocked(fetchMetadata).mockResolvedValue(
      new Response('error', { status: 500 })
    );

    const { records } = await mapMetadataToSupabase([
      makeMoment('moment-uuid'),
    ]);

    expect(records).toHaveLength(0);
  });

  it('skips moment when fetch throws', async () => {
    vi.mocked(fetchMetadata).mockRejectedValue(new Error('network error'));

    const { records } = await mapMetadataToSupabase([
      makeMoment('moment-uuid'),
    ]);

    expect(records).toHaveLength(0);
  });

  it('processes multiple moments in parallel', async () => {
    vi.mocked(fetchMetadata).mockImplementation(() =>
      Promise.resolve(okResponse())
    );

    const moments = [
      makeMoment('uuid-1', '0x1'),
      makeMoment('uuid-2', '0x2'),
      makeMoment('uuid-3', '0x3'),
    ];

    const { records, artistNamesByAddresses } =
      await mapMetadataToSupabase(moments);

    expect(records).toHaveLength(3);
    expect(fetchMetadata).toHaveBeenCalledTimes(3);
    expect(artistNamesByAddresses.size).toBe(3);
  });
});
