const MAX_ATTEMPTS = 5;
const MIN_DELAY_MS = 1_000;
const FACTOR = 2;
const TIMEOUT_MS = 30_000;

export async function fetchMetadata(uri: string): Promise<Response> {
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(
        // `https://api.inprocess.world/api/metadata?uri=${encodeURIComponent(uri)}`,
        `https://turbo-gateway.com/${uri.replace("ar://", "")}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (response.ok) return response;
      attempt++;
      if (attempt >= MAX_ATTEMPTS) return response;
    } catch (err) {
      clearTimeout(timeout);
      attempt++;
      if (attempt >= MAX_ATTEMPTS) throw err;
    }
    await new Promise(r =>
      setTimeout(r, MIN_DELAY_MS * Math.pow(FACTOR, attempt - 1))
    );
  }
  throw new Error(`fetchMetadata exhausted for uri ${uri}`);
}
