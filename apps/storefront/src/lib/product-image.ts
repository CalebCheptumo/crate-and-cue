type ProductWithImage = { handle: string; thumbnail?: string | null };

/**
 * Medusa's thumbnail wins. Until real photos exist, fall back to the
 * illustration in /public/products named after the product handle.
 */
export function productImageSrc(product: ProductWithImage): string {
  return product.thumbnail ?? `/products/${product.handle}.svg`;
}
