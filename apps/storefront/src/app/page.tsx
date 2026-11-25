import { Suspense } from 'react';
import { connection } from 'next/server';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/medusa';
import { getDefaultRegion } from '@/lib/region';
import { formatPrice } from '@/lib/format';
import { productImageSrc } from '@/lib/product-image';
import { ProductCard } from '@/components/product-card';

/** Lowest calculated price across a product's variants, if any have one. */
function cheapestAmount(product: HttpTypes.StoreProduct): number | undefined {
  const amounts = (product.variants ?? [])
    .map((variant) => variant.calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === 'number');

  return amounts.length ? Math.min(...amounts) : undefined;
}

const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4';

function GridSkeleton() {
  return (
    <div className={gridClass} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/3] rounded-lg bg-zinc-900" />
          <div className="mt-3 h-4 w-3/4 rounded bg-zinc-900" />
          <div className="mt-2 h-4 w-1/3 rounded bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid() {
  await connection();

  const region = await getDefaultRegion();
  const { products } = await sdk.store.product.list({
    limit: 12,
    region_id: region.id,
    fields: '*variants.calculated_price',
  });

  if (!products.length) {
    return <p className="text-zinc-400">No products are available yet. Please check back soon.</p>;
  }

  return (
    <ul className={gridClass}>
      {products.map((product) => {
        const amount = cheapestAmount(product);

        return (
          <li key={product.id}>
            <ProductCard
              handle={product.handle}
              title={product.title}
              imageSrc={productImageSrc(product)}
              price={
                amount === undefined
                  ? 'Price unavailable'
                  : formatPrice(amount, region.currency_code)
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-8">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
          DJ gear, from your first decks to the club booth
        </h1>
        <p className="mt-3 max-w-xl text-zinc-300">
          Controllers, mixers, turntables, headphones, monitors, mics and cameras.
        </p>
        <a
          href="#gear"
          className="mt-6 inline-flex min-h-11 items-center rounded bg-amber-400 px-5 font-medium text-zinc-950 hover:bg-amber-300"
        >
          Shop all gear
        </a>
      </section>

      <section id="gear" className="pb-16">
        <h2 className="mb-6 text-2xl font-semibold">All gear</h2>
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </section>
    </main>
  );
}
