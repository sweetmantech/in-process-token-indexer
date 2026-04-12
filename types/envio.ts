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
  readonly token_id: string; // BigInt from GraphQL comes as string
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
  readonly token_id: string; // BigInt from GraphQL comes as string
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
  readonly token_id: string; // BigInt from GraphQL comes as string
  readonly comment: string | undefined;
  readonly chain_id: number;
  readonly commented_at: number;
  readonly transaction_hash: string;
};

export interface MomentCommentsQueryResult {
  entities: InProcess_Moment_Comments_t[];
  pageInfo: PageInfo;
}

export type Primary_Sales_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: string; // BigInt from GraphQL comes as string
  readonly sale_start: string | null; // BigInt, nullable
  readonly sale_end: string | null; // BigInt, nullable
  readonly max_tokens_per_address: string | null; // BigInt, nullable
  readonly price_per_token: string; // BigInt from GraphQL comes as string
  readonly funds_recipient: string;
  readonly currency: string;
  readonly chain_id: number;
  readonly transaction_hash: string;
  readonly created_at: number;
};

export interface PrimarySalesQueryResult {
  entities: Primary_Sales_t[];
  pageInfo: PageInfo;
}

/** Unified Envio `Transfers` entity (InProcess, Catalog, Sound). */
export type Transfers_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: string;
  readonly chain_id: number;
  readonly recipient: string;
  readonly quantity: string;
  readonly value: string | undefined;
  readonly currency: string | undefined;
  readonly transaction_hash: string;
  readonly transferred_at: number;
};

export interface TransfersQueryResult {
  entities: Transfers_t[];
  pageInfo: PageInfo;
}

export type Catalog_Collections_t = {
  readonly id: string;
  readonly address: string;
  readonly name: string;
  readonly creator: string;
  readonly uri: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly updated_at: number;
  readonly transaction_hash: string;
};

export type Catalog_Moments_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: string; // BigInt from GraphQL comes as string
  readonly artist: string;
  readonly uri: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly updated_at: number;
  readonly transaction_hash: string;
};

export type Catalog_Admins_t = {
  readonly id: string;
  readonly admin: string;
  readonly collection: string;
  readonly token_id: string; // BigInt from GraphQL comes as string
  readonly chain_id: number;
  readonly auth_scope: number;
  readonly updated_at: number;
};

export type Catalog_Sales_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: number;
  readonly price_per_token: string; // BigInt from GraphQL comes as string
  readonly funds_recipient: string;
  readonly currency: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly transaction_hash: string;
};

export type Sound_Editions_t = {
  readonly id: string;
  readonly address: string;
  readonly name: string;
  readonly owner: string;
  readonly uri: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly updated_at: number;
  readonly transaction_hash: string;
};

export type Sound_Moments_t = {
  readonly id: string;
  readonly collection: string;
  readonly tier: number;
  readonly uri: string;
  readonly chain_id: number;
  readonly created_at: number;
  readonly updated_at: number;
  readonly transaction_hash: string;
};

export type Sound_Admins_t = {
  readonly id: string;
  readonly collection: string;
  readonly token_id: string; // BigInt from GraphQL comes as string
  readonly admin: string;
  readonly roles: number;
  readonly chain_id: number;
  readonly updated_at: number;
};
