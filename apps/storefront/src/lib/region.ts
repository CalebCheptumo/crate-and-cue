import { sdk } from '@/lib/medusa';

// One region only (ADR 001), so the first one is the store's region.
export async function getDefaultRegion() {
  const { regions } = await sdk.store.region.list();
  const region = regions[0];

  if (!region) {
    throw new Error('No region is configured in the store.');
  }

  return region;
}
