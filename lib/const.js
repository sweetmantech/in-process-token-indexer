import { zoraCreator1155FactoryImplABI } from "@zoralabs/protocol-deployments";
import dotenv from "dotenv";

dotenv.config();

export const SMART_WALLET_SEND_OPERATION_EVENT = "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f"
export const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
export const BASE_SEPOLIA_FIRST_BLOCK = BigInt(
  process.env.BASE_SEPOLIA_FIRST_BLOCK || "0"
);
export const BASE_FIRST_BLOCK = BigInt(process.env.BASE_FIRST_BLOCK || "0");
export const COINBASE_RPC_KEY = process.env.COINBASE_RPC_KEY;
export const EVENT_NAME = "SetupNewContract";
export const ABI = zoraCreator1155FactoryImplABI;
export const GRPC_ENDPOINT =
  "https://indexer.dev.hyperindex.xyz/9155af6/v1/graphql";
