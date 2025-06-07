import { zoraCreator1155FactoryImplABI } from "@zoralabs/protocol-deployments";
import dotenv from "dotenv";

dotenv.config();

export const BASE_SEPOLIA_FIRST_BLOCK = BigInt(
  process.env.BASE_SEPOLIA_FIRST_BLOCK || "0"
);
export const BASE_FIRST_BLOCK = BigInt(process.env.BASE_FIRST_BLOCK || "0");
export const COINBASE_RPC_KEY = process.env.COINBASE_RPC_KEY;
export const EVENT_NAME = "SetupNewContract";
export const ABI = zoraCreator1155FactoryImplABI;
