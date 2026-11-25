import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { sdk } from '@/lib/medusa';
import { CART_COOKIE } from '@/lib/cart';
import { formatPrice } from '@/lib/format';

async function CartContents() {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;

  if (!cartId) {
    return <p>Your cart is empty.</p>;
  }

  const { cart } = await sdk.store.cart.retrieve(cartId);
  const items = cart.items ?? [];

  if (!items.length) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.product_title ?? item.title}
              {item.variant_title ? ` — ${item.variant_title}` : ''} × {item.quantity}
            </span>
            <span>{formatPrice(item.unit_price * item.quantity, cart.currency_code)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatPrice(cart.total, cart.currency_code)}</span>
      </p>
    </>
  );
}

export default function CartPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="mb-6 inline-block text-zinc-400">
        ← Keep shopping
      </Link>
      <h1 className="mb-6 text-3xl font-semibold">Your cart</h1>
      <Suspense fallback={<p>Loading cart…</p>}>
        <CartContents />
      </Suspense>
    </main>
  );
}
