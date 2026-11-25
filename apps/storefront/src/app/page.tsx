import { Suspense } from 'react';
import { connection } from 'next/server';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/medusa';

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount);
}

/** Lowest calculated price across a product's variants, if any have one. */
function cheapestAmount(product: HttpTypes.StoreProduct): number | undefined {
  const amounts = (product.variants ?? [])
    .map((variant) => variant.calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === 'number');

  return amounts.length ? Math.min(...amounts) : undefined;
}

async function ProductList() {
  await connection();

  // We only have one region (ADR 001), so we take the first. A real store would
  // let the customer choose and remember the choice.
  const { regions } = await sdk.store.region.list();
  const region = regions[0];

  if (!region) {
    return <p>No region is configured in the store.</p>;
  }

  const { products } = await sdk.store.product.list({
    limit: 12,
    region_id: region.id,
    fields: '*variants.calculated_price',
  });

  return (
    <ul className="space-y-2">
      {products.map((product) => {
        const amount = cheapestAmount(product);

        return (
          <li key={product.id} className="flex justify-between gap-4">
            <span>
              {product.title} <span className="text-zinc-500">({product.handle})</span>
            </span>
            <span>{amount === undefined ? '—' : formatPrice(amount, region.currency_code)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-semibold">Crate &amp; Cue</h1>
      <Suspense fallback={<p>Loading products…</p>}>
        <ProductList />
      </Suspense>
    </main>
  );
}
