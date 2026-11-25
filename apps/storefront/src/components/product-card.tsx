import Image from 'next/image';
import Link from 'next/link';

type Props = {
  handle: string;
  title: string;
  imageSrc: string;
  price: string;
};

export function ProductCard({ handle, title, imageSrc, price }: Props) {
  return (
    <Link
      href={`/products/${handle}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
    >
      <div className="overflow-hidden rounded-lg bg-zinc-900">
        {/* Empty alt: the title below already names the product. */}
        <Image
          src={imageSrc}
          alt=""
          width={400}
          height={300}
          unoptimized
          className="h-auto w-full motion-safe:transition-transform motion-safe:group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 font-medium group-hover:underline">{title}</h3>
      <p className="text-zinc-300">{price}</p>
    </Link>
  );
}
