import { expect, test, beforeEach } from 'vitest';
import { navigateTo } from '../src/router.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="view-dashboard" class="view" style="display: none;"></div>
    <div id="view-logging" class="view" style="display: none;"></div>
  `;
});

test('Navigates to logging view', () => {
  navigateTo('view-logging');
  expect(document.getElementById('view-logging').style.display).toBe('');
  expect(document.getElementById('view-dashboard').style.display).toBe('none');
});
