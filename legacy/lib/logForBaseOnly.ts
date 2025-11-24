// Helper function to log only for base network (not baseSepolia)
export const logForBaseOnly = (network: string, ...args: unknown[]): void => {
  if (network === 'base') {
    console.log(...args);
  }
};
