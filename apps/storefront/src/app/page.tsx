import { Suspense } from 'react';
import { connection } from 'next/server';
import { sdk } from '@/lib/medusa';

async function ProductList() {
  await connection();
  const { products } = await sdk.store.product.list({ limit: 12 });

  return (
    <ul className="space-y-2">
      {products.map((product) => (
        <li key={product.id}>
          {product.title} <span className="text-zinc-500">({product.handle})</span>
        </li>
      ))}
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
