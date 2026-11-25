'use server';
import { redirect } from 'next/navigation';
import { sdk } from '@/lib/medusa';
import { getDefaultRegion } from '@/lib/region';
import { getOrCreateCartId } from '@/lib/cart';

export async function addToCart(formData: FormData) {
  const variantId = formData.get('variantId');

  if (typeof variantId !== 'string' || !variantId) {
    throw new Error('variantId is required');
  }

  const region = await getDefaultRegion();
  const cartId = await getOrCreateCartId(region.id);

  await sdk.store.cart.createLineItem(cartId, { variant_id: variantId, quantity: 1 });
  redirect(`/cart`);
}
