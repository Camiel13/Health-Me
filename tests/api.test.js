import { expect, test } from 'vitest';
import { searchFood } from '../src/api.js';

test('searchFood returns formatted results', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ products: [{ product_name: 'Apple', nutriments: { 'energy-kcal_100g': 52 } }] })
  });
  const results = await searchFood('apple');
  expect(results[0].name).toBe('Apple');
  expect(results[0].calories).toBe(52);
});
