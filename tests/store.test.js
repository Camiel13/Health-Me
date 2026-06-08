import { expect, test, beforeEach } from 'vitest';
import { initStore, getState } from '../src/store.js';

beforeEach(() => {
  localStorage.clear();
});

test('Store initializes with default state', () => {
  initStore();
  const state = getState();
  expect(state.calories).toBe(0);
  expect(state.steps).toBe(0);
});
