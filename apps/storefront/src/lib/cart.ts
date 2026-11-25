import { cookies } from 'next/headers';
import { sdk } from '@/lib/medusa';

export const CART_COOKIE = 'cart_id';

/** Returns the visitor's cart id, creating a cart the first time. Server actions only. */
export async function getOrCreateCartId(regionId: string): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const { cart } = await sdk.store.cart.create({ region_id: regionId });

  jar.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return cart.id;
}
