'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { sdk } from '@/lib/medusa';
import { CART_COOKIE } from '@/lib/cart';

async function requireCartId(): Promise<string> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;

  if (!cartId) {
    throw new Error('No cart found');
  }

  return cartId;
}

export async function updateQuantity(formData: FormData) {
  const itemId = formData.get('itemId');
  const quantity = Number(formData.get('quantity'));

  if (typeof itemId !== 'string' || !itemId) {
    throw new Error('itemId is required');
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error('Quantity must be a whole number from 1 to 99');
  }

  const cartId = await requireCartId();
  await sdk.store.cart.updateLineItem(cartId, itemId, { quantity });
  revalidatePath('/cart');
}

export async function removeItem(formData: FormData) {
  const itemId = formData.get('itemId');

  if (typeof itemId !== 'string' || !itemId) {
    throw new Error('itemId is required');
  }

  const cartId = await requireCartId();
  await sdk.store.cart.deleteLineItem(cartId, itemId);
  revalidatePath('/cart');
}
