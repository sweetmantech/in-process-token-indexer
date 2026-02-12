export interface PageInfo {
  hasNextPage: boolean;
  nextOffset: number;
}

export type InProcess_Collections_t = {
  readonly address: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly default_admin: string;
  readonly id: string;
  readonly name: string;
  readonly payout_recipient: string;
  readonly transaction_hash: string;
  readonly updated_at: number;
  readonly uri: string;
};

export interface CollectionsQueryResult {
  entities: InProcess_Collections_t[];
  pageInfo: PageInfo;
}

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

export interface MomentsQueryResult {
  entities: InProcess_Moments_t[];
  pageInfo: PageInfo;
}

export type InProcess_Admins_t = {
  readonly id: string;
  readonly admin: string;
  readonly collection: string;
  readonly token_id: number;
  readonly chain_id: number;
  readonly permission: number;
  readonly updated_at: number;
};

export interface AdminsQueryResult {
  entities: InProcess_Admins_t[];
  pageInfo: PageInfo;
}

export type InProcess_Moment_Comments_t = {
  readonly id: string;
  readonly collection: string;
  readonly sender: string;
  readonly token_id: number;
  readonly comment: string | undefined;
  readonly chain_id: number;
  readonly commented_at: number;
  readonly transaction_hash: string;
};

export interface MomentCommentsQueryResult {
  entities: InProcess_Moment_Comments_t[];
  pageInfo: PageInfo;
}

export type InProcess_Sales_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: number;
  readonly sale_start: string; // BigInt from GraphQL comes as string
  readonly sale_end: string; // BigInt from GraphQL comes as string
  readonly max_tokens_per_address: string; // BigInt from GraphQL comes as string
  readonly price_per_token: string; // BigInt from GraphQL comes as string
  readonly funds_recipient: string;
  readonly currency: string;
  readonly chain_id: number;
  readonly transaction_hash: string;
  readonly created_at: number;
};

export interface SalesQueryResult {
  entities: InProcess_Sales_t[];
  pageInfo: PageInfo;
}

export type InProcess_Payments_t = {
  readonly id: string;
  readonly collection: string;
  readonly currency: string;
  readonly token_id: number;
  readonly recipient: string;
  readonly spender: string;
  readonly amount: string;
  readonly chain_id: number;
  readonly transaction_hash: string;
  readonly transferred_at: number;
};

export interface PaymentsQueryResult {
  entities: InProcess_Payments_t[];
  pageInfo: PageInfo;
}

export type InProcess_Airdrops_t = {
  readonly id: string;
  readonly recipient: string;
  readonly collection: string;
  readonly token_id: number;
  readonly amount: number;
  readonly chain_id: number;
  readonly updated_at: number;
};

export interface AirdropsQueryResult {
  entities: InProcess_Airdrops_t[];
  pageInfo: PageInfo;
}

export type InProcess_Collectors_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: number;
  readonly amount: number;
  readonly chain_id: number;
  readonly collector: string;
  readonly transaction_hash: string;
  readonly collected_at: number;
};

export interface CollectorsQueryResult {
  entities: InProcess_Collectors_t[];
  pageInfo: PageInfo;
}
