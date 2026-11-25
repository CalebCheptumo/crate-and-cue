import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { sdk } from '@/lib/medusa';
import { CART_COOKIE } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { productImageSrc } from '@/lib/product-image';
import { removeItem, updateQuantity } from './actions';

const controlClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-zinc-700 hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-40';

function EmptyCart() {
  return (
    <div>
      <p className="text-zinc-300">Your cart is empty.</p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center rounded bg-amber-400 px-5 font-medium text-zinc-950 hover:bg-amber-300"
      >
        Browse gear
      </Link>
    </div>
  );
}

async function CartContents() {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const { cart } = await sdk.store.cart.retrieve(cartId);
  const items = cart.items ?? [];

  if (!items.length) {
    return <EmptyCart />;
  }

  const money = (amount: number) => formatPrice(amount, cart.currency_code);

  return (
    <>
      <ul className="divide-y divide-zinc-800 border-y border-zinc-800">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            {item.product_handle ? (
              <Image
                src={productImageSrc({ handle: item.product_handle, thumbnail: item.thumbnail })}
                alt=""
                width={400}
                height={300}
                unoptimized
                className="h-auto w-24 shrink-0 self-start rounded bg-zinc-900 sm:w-32"
              />
            ) : null}

            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-medium">
                    {item.product_handle ? (
                      <Link href={`/products/${item.product_handle}`} className="hover:underline">
                        {item.product_title ?? item.title}
                      </Link>
                    ) : (
                      (item.product_title ?? item.title)
                    )}
                  </h2>
                  {item.variant_title ? (
                    <p className="text-sm text-zinc-400">{item.variant_title}</p>
                  ) : null}
                  <p className="text-sm text-zinc-400">{money(item.unit_price)} each</p>
                </div>
                <p className="font-medium">{money(item.unit_price * item.quantity)}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={updateQuantity}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="quantity" value={item.quantity - 1} />
                  <button
                    type="submit"
                    className={controlClass}
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.product_title ?? item.title}`}
                  >
                    −
                  </button>
                </form>
                <span className="min-w-8 text-center" aria-label="Quantity">
                  {item.quantity}
                </span>
                <form action={updateQuantity}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="quantity" value={item.quantity + 1} />
                  <button
                    type="submit"
                    className={controlClass}
                    aria-label={`Increase quantity of ${item.product_title ?? item.title}`}
                  >
                    +
                  </button>
                </form>
                <form action={removeItem} className="ml-2">
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center px-2 text-sm text-zinc-400 underline hover:text-zinc-100"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{money(cart.total)}</span>
      </div>
      <p className="mt-4 text-sm text-zinc-400">Checkout is not available in this demo yet.</p>
    </>
  );
}

export default function CartPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-11 items-center text-zinc-400 hover:text-zinc-100"
      >
        ← Keep shopping
      </Link>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Your cart</h1>
      <Suspense fallback={<p>Loading cart…</p>}>
        <CartContents />
      </Suspense>
    </main>
  );
}
