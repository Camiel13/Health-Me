import { expect, test } from 'vitest';
import { exportData } from '../src/privacy.js';

test('exportData returns stringified state', () => {
  localStorage.setItem('health_app_state', JSON.stringify({ steps: 500 }));
  const data = exportData();
  expect(JSON.parse(data).steps).toBe(500);
});
