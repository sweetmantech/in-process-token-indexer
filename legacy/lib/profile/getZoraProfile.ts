interface ZoraProfile {
  displayName?: string;
  description?: string;
  socialAccounts?: {
    twitter?: { username?: string };
    instagram?: { username?: string };
  };
}

async function getZoraProfile(address: string): Promise<ZoraProfile | null> {
  if (!address) return null;
  const response = await fetch(
    `https://zora.co/api/trpc/profile.getProfile?input={"json":"${address}"}`
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    result?: { data?: { json?: ZoraProfile } };
  };
  return data.result?.data?.json || null;
}

export default getZoraProfile;
