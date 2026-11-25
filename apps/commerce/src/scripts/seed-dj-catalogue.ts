/**
 * Seeds the Crate & Cue DJ catalogue.
 *
 *   pnpm --filter commerce exec medusa exec ./src/scripts/seed-dj-catalogue.ts
 *
 * Idempotent: every product has a fixed handle and existing handles are skipped,
 * so it is safe to run again (locally, or later from a pipeline).
 * Requires the initial data seed (sales channel, shipping profile, Color option).
 */
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from '@medusajs/medusa/core-flows';
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils';
import type { ExecArgs } from '@medusajs/framework/types';

const SALES_CHANNEL_NAME = 'Default Sales Channel';
const BATCH_SIZE = 4;

type CatalogueProduct = {
  handle: string;
  title: string;
  category: string;
  description: string;
  priceEur: number;
  weightGrams: number;
  colors: ('Black' | 'White')[];
};

const CATEGORIES = [
  'Controllers',
  'Mixers',
  'Turntables',
  'Headphones',
  'Speakers',
  'Microphones',
  'Cameras',
];

const PRODUCTS: CatalogueProduct[] = [
  {
    handle: 'pulse-4-controller',
    title: 'Pulse 4 DJ Controller',
    category: 'Controllers',
    description:
      '4-channel controller with jog wheels, performance pads and a built-in audio interface.',
    priceEur: 449,
    weightGrams: 6200,
    colors: ['Black'],
  },
  {
    handle: 'pulse-2-controller',
    title: 'Pulse 2 DJ Controller',
    category: 'Controllers',
    description: 'Compact 2-channel controller for bedroom practice and small gigs.',
    priceEur: 199,
    weightGrams: 2800,
    colors: ['Black', 'White'],
  },
  {
    handle: 'blend-4-mixer',
    title: 'Blend 4 Club Mixer',
    category: 'Mixers',
    description: '4-channel club mixer with analogue filters and a magnetic crossfader.',
    priceEur: 899,
    weightGrams: 7500,
    colors: ['Black'],
  },
  {
    handle: 'spin-direct-turntable',
    title: 'Spin Direct-Drive Turntable',
    category: 'Turntables',
    description: 'High-torque direct-drive turntable with pitch control and reverse play.',
    priceEur: 549,
    weightGrams: 11000,
    colors: ['Black', 'White'],
  },
  {
    handle: 'monitor-pro-headphones',
    title: 'Monitor Pro Headphones',
    category: 'Headphones',
    description: 'Closed-back DJ headphones with swivel earcups and a detachable coiled cable.',
    priceEur: 129,
    weightGrams: 320,
    colors: ['Black', 'White'],
  },
  {
    handle: 'booth-8-monitor',
    title: 'Booth 8 Active Monitor',
    category: 'Speakers',
    description: '8-inch active booth monitor with balanced XLR and TRS inputs.',
    priceEur: 349,
    weightGrams: 9800,
    colors: ['Black'],
  },
  {
    handle: 'talk-dynamic-mic',
    title: 'Talk Dynamic Microphone',
    category: 'Microphones',
    description: 'Cardioid dynamic vocal microphone built for MCs and live hosting.',
    priceEur: 79,
    weightGrams: 300,
    colors: ['Black'],
  },
  {
    handle: 'stream-1080-camera',
    title: 'Stream 1080 Camera',
    category: 'Cameras',
    description: '1080p webcam with wide-angle lens for live-streamed sets.',
    priceEur: 119,
    weightGrams: 180,
    colors: ['Black', 'White'],
  },
];

export default async function seedDjCatalogue({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // ---- 1. Prerequisites: fail loudly, never guess --------------------------

  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
    filters: { name: SALES_CHANNEL_NAME },
  });
  const { data: shippingProfiles } = await query.graph({
    entity: 'shipping_profile',
    fields: ['id'],
  });
  const { data: colorOptions } = await query.graph({
    entity: 'product_option',
    fields: ['id', 'title'],
    filters: { title: 'Color', is_exclusive: false },
  });

  const salesChannel = salesChannels[0];
  const shippingProfile = shippingProfiles[0];
  const colorOption = colorOptions[0];

  if (!salesChannel || !shippingProfile || !colorOption) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Missing "${SALES_CHANNEL_NAME}", a shipping profile or the shared Color option. Run the initial data seed first.`,
    );
  }

  // ---- 2. Categories: create only the missing ones -------------------------

  const { data: existingCategories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'name'],
  });
  const missingCategories = CATEGORIES.filter(
    (name) => !existingCategories.some((category) => category.name === name),
  );

  if (missingCategories.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((name) => ({ name, is_active: true })),
      },
    });
    logger.info(`Created ${missingCategories.length} categorie(s)`);
  }

  const { data: categories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'name'],
  });

  // ---- 3. Products: skip handles that already exist ------------------------

  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['handle'],
  });
  const takenHandles = new Set(existingProducts.map((product) => product.handle));

  const toCreate = PRODUCTS.filter((product) => !takenHandles.has(product.handle));

  if (!toCreate.length) {
    logger.info('Every DJ product already exists. Nothing to do.');
    return;
  }

  const inputs = toCreate.map((product) => {
    const category = categories.find((item) => item.name === product.category);

    if (!category) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Category "${product.category}" not found for ${product.handle}`,
      );
    }

    return {
      title: product.title,
      handle: product.handle,
      description: product.description,
      status: ProductStatus.PUBLISHED,
      weight: product.weightGrams,
      shipping_profile_id: shippingProfile.id,
      category_ids: [category.id],
      sales_channels: [{ id: salesChannel.id }],
      options: [{ id: colorOption.id }],
      variants: product.colors.map((color) => ({
        title: color,
        sku: `${product.handle.toUpperCase()}-${color.toUpperCase()}`,
        options: { Color: color },
        prices: [
          { amount: product.priceEur, currency_code: 'eur' },
          { amount: Math.round(product.priceEur * 1.1), currency_code: 'usd' },
        ],
      })),
    };
  });

  let created = 0;

  for (let start = 0; start < inputs.length; start += BATCH_SIZE) {
    const batch = inputs.slice(start, start + BATCH_SIZE);

    await createProductsWorkflow(container).run({
      input: { products: batch as never },
    });

    created += batch.length;
    logger.info(`Created ${created}/${inputs.length} DJ products`);
  }
  // ---- 4. Let the search index catch up (best effort) ----------------------

  // `medusa exec` is short-lived: it can exit before the async product.created
  // handler finishes, so we replay the ingestion and wait for it. On a fresh
  // database the search index has no active version until the backend has
  // booted once, so this step can fail. The products already exist by now, so
  // a search problem must not fail the whole seed.
  try {
    const search = container.resolve(Modules.SEARCH);
    const { data: allProducts } = await query.graph({ entity: 'product', fields: ['id'] });

    await search.ingest({
      name: 'product.created',
      data: allProducts.map((product) => ({ id: product.id })),
    } as never);

    logger.info('Search index caught up.');
  } catch (error) {
    logger.warn(
      `Search ingestion skipped: ${(error as Error).message}. Start the backend once, then check the index.`,
    );
  }

  logger.info('Done. Open the Admin to see the DJ catalogue.');
}
