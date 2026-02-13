import { describe, it, expect } from 'vitest';
import { buildQuery } from '@/lib/grpc/buildQuery';
import type { IndexConfig } from '@/types/factory';

const makeIndexer = (name: string, fragment: string): IndexConfig<unknown> => ({
  processBatchFn: async () => {},
  selectMaxTimestampFn: async () => null,
  indexName: name,
  dataPath: `InProcess_${name}`,
  queryFragment: fragment,
});

describe('buildQuery', () => {
  it('builds a query with a single indexer', () => {
    const indexers = [
      makeIndexer(
        'admins',
        'InProcess_Admins(limit: $limit, offset: $offset_admins) { id }'
      ),
    ];

    const query = buildQuery(indexers);

    expect(query).toContain('query GetAll(');
    expect(query).toContain('$limit: Int');
    expect(query).toContain('$offset_admins: Int');
    expect(query).toContain('$minTimestamp_admins: Int');
    expect(query).toContain(
      'InProcess_Admins(limit: $limit, offset: $offset_admins) { id }'
    );
  });

  it('builds a query with multiple indexers', () => {
    const indexers = [
      makeIndexer('admins', 'InProcess_Admins { id }'),
      makeIndexer('moments', 'InProcess_Moments { id }'),
    ];

    const query = buildQuery(indexers);

    expect(query).toContain('$offset_admins: Int');
    expect(query).toContain('$minTimestamp_admins: Int');
    expect(query).toContain('$offset_moments: Int');
    expect(query).toContain('$minTimestamp_moments: Int');
    expect(query).toContain('InProcess_Admins { id }');
    expect(query).toContain('InProcess_Moments { id }');
  });

  it('returns valid query structure', () => {
    const indexers = [makeIndexer('sales', 'InProcess_Sales { id }')];

    const query = buildQuery(indexers);

    expect(query).toMatch(/^query GetAll\(.*\) \{/);
    expect(query).toMatch(/\}$/);
  });

  it('handles empty indexers array', () => {
    const query = buildQuery([]);

    expect(query).toContain('query GetAll($limit: Int)');
  });
});
