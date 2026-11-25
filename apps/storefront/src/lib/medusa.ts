import Medusa from '@medusajs/js-sdk';

const baseUrl = process.env.MEDUSA_BACKEND_URL;
const publishableKey = process.env.MEDUSA_PUBLISHABLE_KEY;

if (!baseUrl || !publishableKey) {
  throw new Error('MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY must be set');
}

export const sdk = new Medusa({ baseUrl, publishableKey });
