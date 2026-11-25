import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { sdk } from '@/lib/medusa';
import { getDefaultRegion } from '@/lib/region';
import { formatPrice } from '@/lib/format';
import { addToCart } from './actions';

type Props = { params: Promise<{ handle: string }> };

async function ProductDetail({ params }: Props) {
  await connection();
  const { handle } = await params;
  const region = await getDefaultRegion();

  const { products } = await sdk.store.product.list({
    handle,
    region_id: region.id,
    fields: '*variants.calculated_price',
  });
  // Match explicitly, in case the handle filter is ignored.
  const product = products.find((item) => item.handle === handle);

  if (!product) {
    notFound();
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold">{product.title}</h1>
      <p className="mb-6 text-zinc-400">{product.description}</p>
      <ul className="space-y-3">
        {(product.variants ?? []).map((variant) => {
          const amount = variant.calculated_price?.calculated_amount;

          return (
            <li key={variant.id} className="flex items-center justify-between gap-4">
              <span>{variant.title}</span>
              <span>
                {typeof amount === 'number' ? formatPrice(amount, region.currency_code) : '—'}
              </span>
              <form action={addToCart}>
                <input type="hidden" name="variantId" value={variant.id} />
                <button type="submit" className="rounded bg-white px-3 py-1 text-black">
                  Add to cart
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="mb-6 inline-block text-zinc-400">
        ← All products
      </Link>
      <Suspense fallback={<p>Loading product…</p>}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}
