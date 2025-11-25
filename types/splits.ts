export interface SplitRecipient {
  address: string;
  percentAllocation: string;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}
