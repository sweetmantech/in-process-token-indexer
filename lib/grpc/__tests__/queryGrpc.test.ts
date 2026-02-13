import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  GRPC_ENDPOINT: 'https://test-endpoint.com/graphql',
}));

import fetch from 'node-fetch';
import { queryGrpc } from '@/lib/grpc/queryGrpc';

const mockFetch = vi.mocked(fetch);

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as any;

describe('queryGrpc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data from a successful response', async () => {
    const data = { InProcess_Admins: [{ id: '1' }] };
    mockFetch.mockResolvedValue(mockResponse({ data }));

    const result = await queryGrpc('query { }', { limit: 100 });

    expect(result).toEqual(data);
  });

  it('sends query and variables in POST body', async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: {} }));

    const query = 'query GetAll($limit: Int) { admins { id } }';
    const variables = { limit: 1000, offset_admins: 0 };

    await queryGrpc(query, variables);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test-endpoint.com/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      }
    );
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValue(mockResponse({}, false, 500));

    await expect(queryGrpc('query { }', {})).rejects.toThrow(
      'HTTP error! status: 500'
    );
  });

  it('throws on GraphQL errors', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ errors: [{ message: 'field not found' }] })
    );

    await expect(queryGrpc('query { }', {})).rejects.toThrow('GraphQL errors');
  });

  it('returns empty object when data is null', async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: null }));

    const result = await queryGrpc('query { }', {});

    expect(result).toEqual({});
  });
});
