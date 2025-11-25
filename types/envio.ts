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

export type InProcess_Moments_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: number;
  readonly uri: string;
  readonly max_supply: string; // BigInt from GraphQL comes as string
  readonly chain_id: number;
  readonly created_at: number;
  readonly updated_at: number;
  readonly transaction_hash: string;
};

export interface PageInfo {
  hasNextPage: boolean;
  nextOffset: number;
}

export interface QueryResult {
  collections: InProcess_Collections_t[];
  pageInfo: PageInfo;
}

export interface MomentsQueryResult {
  moments: InProcess_Moments_t[];
  pageInfo: PageInfo;
}

export type InProcess_Moment_Admins_t = {
  readonly id: string;
  readonly admin: string;
  readonly collection: string;
  readonly token_id: number;
  readonly chain_id: number;
  readonly granted_at: number;
};

export interface MomentAdminsQueryResult {
  momentAdmins: InProcess_Moment_Admins_t[];
  pageInfo: PageInfo;
}
