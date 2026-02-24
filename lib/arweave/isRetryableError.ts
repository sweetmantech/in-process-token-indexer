const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('504') ||
    msg.includes('gateway timeout') ||
    msg.includes('cdn77')
  );
};

export default isRetryableError;
