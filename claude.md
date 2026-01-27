# In-Process Token Indexer

A Node.js indexer for the In Process protocol on Base/Base Sepolia networks with integrated Telegram bot for media uploads.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Package Manager:** pnpm
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** viem (Base, Base Sepolia)
- **Storage:** Arweave (decentralized file storage)
- **Bot:** Telegram Bot API
- **Testing:** Vitest

## Project Structure

```text
├── lib/
│   ├── indexers/       # IndexFactory base class + entity indexers
│   ├── bot/            # Telegram bot handlers and media processing
│   ├── supabase/       # Database operations by table
│   ├── grpc/           # Hyperindex GraphQL queries
│   ├── api/            # External API calls
│   └── viem/           # Blockchain client setup
├── types/              # TypeScript type definitions
├── tests/              # Vitest unit tests
├── indexer.ts          # Main entry point
└── ecosystem.config.cjs # PM2 configuration
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run with auto-reload (development)
pnpm build            # Compile TypeScript to ./dist
pnpm start            # Run compiled indexer (production)
pnpm test             # Run unit tests
pnpm format           # Format code with Prettier
```

## Architecture

- **IndexFactory Pattern:** Base class handling pagination, incremental indexing, and batch processing
- **Data Flow:** Envio GraphQL → IndexFactory → Supabase
- **Telegram Bot:** Media uploads → Arweave storage → Moment creation
- **Networks:** Base (8453), Base Sepolia (84532)

## Key Files

- `indexer.ts` - Entry point, starts bot and all indexers
- `lib/indexers/IndexFactory.ts` - Core indexing logic with pagination
- `lib/bot/start.ts` - Telegram message handler
- `lib/bot/processMedia.ts` - Media upload orchestration
- `lib/consts.ts` - Environment config and constants

## Environment Variables

See `.env.example` for required variables including Supabase, Telegram, Arweave, and Coinbase credentials.

## Testing

Tests are in `tests/` directory using Vitest. Run `pnpm test` to execute.

## Envio GraphQL Schema

This project maps data from Envio GraphQL to Supabase. Reference project: [sweetmantech/in_process_indexers](https://github.com/sweetmantech/in_process_indexers)

### Entities

```graphql
type InProcess_Collections {
  id: ID!
  address: String!
  name: String!
  uri: String!
  default_admin: String!
  payout_recipient: String!
  chain_id: Int!
  created_at: Int!
  updated_at: Int!
  transaction_hash: String!
}

type InProcess_Moments {
  id: ID!
  collection: String!
  token_id: Int!
  uri: String!
  max_supply: BigInt!
  chain_id: Int!
  created_at: Int!
  updated_at: Int!
  transaction_hash: String!
}

type InProcess_Sales {
  id: ID!
  collection: String!
  token_id: Int!
  sale_start: BigInt!
  sale_end: BigInt!
  max_tokens_per_address: BigInt!
  price_per_token: BigInt!
  funds_recipient: String!
  currency: String!
  chain_id: Int!
  transaction_hash: String!
  created_at: Int!
}

type InProcess_Admins {
  id: ID!
  admin: String!
  collection: String!
  token_id: Int!
  chain_id: Int!
  permission: Int!
  granted_at: Int!
  updated_at: Int!
}

type InProcess_Moment_Comments {
  id: ID!
  collection: String!
  sender: String!
  token_id: Int!
  comment: String
  chain_id: Int!
  commented_at: Int!
  transaction_hash: String!
}

type InProcess_Payments {
  id: ID!
  collection: String!
  currency: String!
  token_id: Int!
  recipient: String!
  spender: String!
  amount: String!
  chain_id: Int!
  transaction_hash: String!
  transferred_at: Int!
}

type InProcess_Airdrops {
  id: ID!
  recipient: String!
  collection: String!
  token_id: Int!
  amount: Int!
  chain_id: Int!
  updated_at: Int!
}
```

### Query Pattern

```graphql
query MyQuery($limit: Int, $offset: Int, $chainId: Int) {
  InProcess_Collections(
    limit: $limit
    offset: $offset
    order_by: { created_at: desc }
    where: { chain_id: { _eq: $chainId } }
  ) {
    id
    address
    name
    # ... other fields
  }
}
```

**Note:** BigInt fields (max_supply, sale_start, etc.) are returned as strings from GraphQL.

## Development Rules

**DO:**

- Query Envio GraphQL entities using exact names from schema (snake_case)
- Use entity names: `InProcess_Collections`, `InProcess_Moments`, `InProcess_Sales`, etc.
- Map Envio entities to Supabase tables appropriately
- Handle BigInt → string conversions

**DON'T:**

- Touch or modify files in `legacy/` directory
- Use old entity names like `ERC20Minter_ERC20RewardsDeposit` (use `InProcess_Payments`)
- Reference legacy code patterns

## Code Style

### Minimize Function Parameters

Pass container objects instead of multiple derived values. Extract what you need inside the function.

**Bad:**
```typescript
function handleMedia({ chatId, photo, video, caption, text, hasCaptionOrText }) {
  // many params derived from msg
}
handleMedia({ chatId: msg.chat.id, photo: msg.photo, ... });
```

**Good:**
```typescript
function handleMedia({ msg }) {
  const { photo, video, caption, text } = getMetadataFromMsg(msg);
  const chatId = msg.chat.id;
  const hasCaptionOrText = !!(caption || text);
}
handleMedia({ msg });
```

Benefits:
- Fewer parameters to pass
- Caller doesn't need to know internal requirements
- Easier to add/remove extracted fields without changing caller

### Mapping Notes

- `InProcess_Airdrops.recipient` → Supabase `recipient` (NOT `artist_address`)
- `collection` + `chain_id` + `token_id` → `moment` UUID in Supabase
- Chain timestamps → ISO timestamps
