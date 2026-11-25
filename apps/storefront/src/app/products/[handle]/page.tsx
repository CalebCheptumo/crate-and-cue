import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { sdk } from '@/lib/medusa';
import { getDefaultRegion } from '@/lib/region';
import { formatPrice } from '@/lib/format';
import { productImageSrc } from '@/lib/product-image';
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

  const variants = product.variants ?? [];
  const amounts = variants
    .map((variant) => variant.calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === 'number');
  const lowest = amounts.length ? Math.min(...amounts) : undefined;
  const highest = amounts.length ? Math.max(...amounts) : undefined;

  const price =
    lowest === undefined
      ? 'Price unavailable'
      : `${lowest !== highest ? 'From ' : ''}${formatPrice(lowest, region.currency_code)}`;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-lg bg-zinc-900">
        <Image
          src={productImageSrc(product)}
          alt={product.title}
          width={400}
          height={300}
          unoptimized
          priority
          className="h-auto w-full"
        />
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
        <p className="mt-2 text-2xl">{price}</p>
        <p className="mt-4 max-w-prose text-zinc-300">{product.description}</p>

        {variants.length === 0 ? (
          <p className="mt-6 text-zinc-400">This product is not available right now.</p>
        ) : (
          <form action={addToCart} className="mt-6">
            <fieldset>
              <legend className="mb-2 text-sm text-zinc-400">Colour</legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant, index) => (
                  <label key={variant.id}>
                    <input
                      type="radio"
                      name="variantId"
                      value={variant.id}
                      defaultChecked={index === 0}
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-11 min-w-20 cursor-pointer items-center justify-center rounded border border-zinc-700 px-4 peer-checked:border-amber-400 peer-checked:bg-zinc-900 peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-400">
                      {variant.title}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded bg-amber-400 px-6 font-medium text-zinc-950 hover:bg-amber-300 sm:w-auto"
            >
              Add to cart
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/#gear"
        className="mb-6 inline-flex min-h-11 items-center text-zinc-400 hover:text-zinc-100"
      >
        ← All gear
      </Link>
      <Suspense fallback={<p>Loading product…</p>}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}
