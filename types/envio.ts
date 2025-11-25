export type InProcess_Collections_t = {
  readonly address: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly default_admin: string;
  readonly id: string;
  readonly payout_recipient: string;
  readonly transaction_hash: string;
  readonly updated_at: number;
  readonly uri: string;
};

export interface PageInfo {
  hasNextPage: boolean;
  nextOffset: number;
}

export interface QueryResult {
  collections: InProcess_Collections_t[];
  pageInfo: PageInfo;
}
