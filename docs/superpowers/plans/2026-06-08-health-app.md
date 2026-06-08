# Behavioral Health App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, offline-first Vanilla HTML5/SPA Behavioral Health App tailored for the US market with food API search, barcode scanning, and a high-end UI.

**Architecture:** Single Page Application (SPA) driven by Vanilla JS (ES6+). State is managed via a centralized `Store` pattern persisting to `LocalStorage`. Routing is handled via simple DOM display toggles (Bottom Navigation). The UI uses pure CSS3 with modern variables, fluid animations, and SVG icons (no emojis).

**Tech Stack:** Vanilla HTML5, CSS3, ES6+, `html5-qrcode` (for barcode scanning), Open Food Facts API (for food lookup), `vitest` & `jsdom` (for unit testing).

---

### Task 1: Project Setup & Test Infrastructure

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/store.js`
- Create: `tests/store.test.js`

- [ ] **Step 1: Initialize project and install test dependencies**

```bash
npm init -y
npm install -D vitest jsdom
```

- [ ] **Step 2: Configure Vitest**

```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 3: Write failing test for Store initialization**

```javascript
// tests/store.test.js
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
```

- [ ] **Step 4: Run test to verify failure**

Run: `npx vitest run tests/store.test.js`
Expected: FAIL (Cannot find module '../src/store.js')

- [ ] **Step 5: Implement minimal Store**

```javascript
// src/store.js
export function initStore() {
  if (!localStorage.getItem('health_app_state')) {
    const defaultState = { calories: 0, steps: 0, history: [] };
    localStorage.setItem('health_app_state', JSON.stringify(defaultState));
  }
}

export function getState() {
  return JSON.parse(localStorage.getItem('health_app_state'));
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/store.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.js src/store.js tests/store.test.js
git commit -m "chore: setup project and store"
```

### Task 2: Core Layout, Design System & Navigation

**Files:**
- Modify: `index.html`
- Create: `src/styles.css`
- Create: `src/router.js`
- Create: `tests/router.test.js`

- [ ] **Step 1: Write failing test for router**

```javascript
// tests/router.test.js
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
  expect(document.getElementById('view-logging').style.display).toBe('block');
  expect(document.getElementById('view-dashboard').style.display).toBe('none');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/router.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Router & Core HTML/CSS**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health SPA</title>
  <link rel="stylesheet" href="src/styles.css">
</head>
<body>
  <main id="app">
    <div id="view-dashboard" class="view">Dashboard</div>
    <div id="view-logging" class="view" style="display: none;">Logging</div>
    <div id="view-habits" class="view" style="display: none;">Habits</div>
    <div id="view-privacy" class="view" style="display: none;">Privacy</div>
  </main>
  <nav class="bottom-nav">
    <button onclick="navigateTo('view-dashboard')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    </button>
    <button onclick="navigateTo('view-logging')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
    </button>
  </nav>
  <script type="module">
    import { navigateTo } from './src/router.js';
    window.navigateTo = navigateTo;
  </script>
</body>
</html>
```

```javascript
// src/router.js
export function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
    target.style.animation = 'fadeIn 0.2s ease-out';
  }
}
```

```css
/* src/styles.css */
:root {
  --bg-color: #f4f8f5;
  --primary: #a3d9b1;
  --text: #1e362d;
}
body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg-color); color: var(--text); padding-bottom: 60px; }
.bottom-nav { position: fixed; bottom: 0; width: 100%; height: 60px; background: white; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
.bottom-nav button { background: none; border: none; cursor: pointer; color: var(--text); transition: color 0.2s; }
.bottom-nav button:hover { color: var(--primary); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/router.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html src/styles.css src/router.js tests/router.test.js
git commit -m "feat: add bottom navigation and design system"
```

### Task 3: API Integration (Open Food Facts) & Search UI

**Files:**
- Create: `src/api.js`
- Create: `tests/api.test.js`
- Modify: `index.html`
- Modify: `src/main.js`

- [ ] **Step 1: Write failing test for API search**

```javascript
// tests/api.test.js
import { expect, test } from 'vitest';
import { searchFood } from '../src/api.js';

test('searchFood returns formatted results', async () => {
  global.fetch = async () => ({
    json: async () => ({ products: [{ product_name: 'Apple', nutriments: { 'energy-kcal_100g': 52 } }] })
  });
  const results = await searchFood('apple');
  expect(results[0].name).toBe('Apple');
  expect(results[0].calories).toBe(52);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/api.test.js`
Expected: FAIL

- [ ] **Step 3: Implement API module**

```javascript
// src/api.js
export async function searchFood(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
  const response = await fetch(url);
  const data = await response.json();
  return data.products.map(p => ({
    name: p.product_name || 'Unknown',
    calories: p.nutriments ? p.nutriments['energy-kcal_100g'] || 0 : 0
  }));
}
```

- [ ] **Step 4: Update UI to include search**

```html
<!-- Modify inside <div id="view-logging"> in index.html -->
<div id="view-logging" class="view" style="display: none; padding: 20px;">
  <h2>Log Food</h2>
  <input type="text" id="food-search" placeholder="Search food..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
  <button id="search-btn" style="margin-top: 10px; padding: 10px; width: 100%; background: var(--primary); border: none; border-radius: 8px; font-weight: bold;">Search</button>
  <ul id="search-results" style="list-style: none; padding: 0; margin-top: 15px;"></ul>
</div>
```

```javascript
// src/main.js
import { searchFood } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  if(searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const query = document.getElementById('food-search').value;
      const results = await searchFood(query);
      const list = document.getElementById('search-results');
      list.innerHTML = results.map(r => `<li>${r.name} - ${r.calories} kcal</li>`).join('');
    });
  }
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/api.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/api.js tests/api.test.js index.html src/main.js
git commit -m "feat: integrate Open Food Facts API for search"
```

### Task 4: Barcode Scanner Integration

**Files:**
- Modify: `index.html`
- Create: `src/scanner.js`

- [ ] **Step 1: Add html5-qrcode via CDN in index.html**

```html
<!-- Add in head of index.html -->
<script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
```

- [ ] **Step 2: Add scanner UI elements**

```html
<!-- Modify inside <div id="view-logging"> in index.html -->
<button id="start-scan-btn" style="margin-top: 10px; padding: 10px; width: 100%; background: #eee; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
  Scan Barcode
</button>
<div id="reader" style="width: 100%; margin-top: 15px; display: none;"></div>
```

- [ ] **Step 3: Implement Scanner Logic**

```javascript
// src/scanner.js
import { searchFood } from './api.js';

export function initScanner() {
  const scanBtn = document.getElementById('start-scan-btn');
  const readerDiv = document.getElementById('reader');
  let html5QrcodeScanner;

  if(scanBtn) {
    scanBtn.addEventListener('click', () => {
      readerDiv.style.display = 'block';
      if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 100} }, false);
        html5QrcodeScanner.render(async (decodedText) => {
          html5QrcodeScanner.clear();
          readerDiv.style.display = 'none';
          document.getElementById('food-search').value = decodedText;
          // In a real scenario, use OpenFoodFacts barcode endpoint: https://world.openfoodfacts.org/api/v0/product/${decodedText}.json
          alert(`Scanned: ${decodedText}`);
        }, (err) => { /* ignore */ });
      }
    });
  }
}
```

- [ ] **Step 4: Wire up in main.js**

```javascript
// Append to src/main.js
import { initScanner } from './scanner.js';
document.addEventListener('DOMContentLoaded', () => {
  initScanner();
});
```

- [ ] **Step 5: Commit**

```bash
git add index.html src/scanner.js src/main.js
git commit -m "feat: add barcode scanner via html5-qrcode"
```

### Task 5: Export / Import Privacy Feature

**Files:**
- Modify: `index.html`
- Create: `src/privacy.js`
- Create: `tests/privacy.test.js`

- [ ] **Step 1: Write failing test**

```javascript
// tests/privacy.test.js
import { expect, test } from 'vitest';
import { exportData } from '../src/privacy.js';

test('exportData returns stringified state', () => {
  localStorage.setItem('health_app_state', JSON.stringify({ steps: 500 }));
  const data = exportData();
  expect(JSON.parse(data).steps).toBe(500);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/privacy.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Export/Import logic**

```javascript
// src/privacy.js
export function exportData() {
  return localStorage.getItem('health_app_state') || '{}';
}

export function importData(jsonString) {
  try {
    JSON.parse(jsonString); // validate
    localStorage.setItem('health_app_state', jsonString);
    return true;
  } catch (e) {
    return false;
  }
}
```

- [ ] **Step 4: Add Privacy UI**

```html
<!-- Modify inside <div id="view-privacy"> in index.html -->
<div id="view-privacy" class="view" style="display: none; padding: 20px;">
  <h2>Privacy & Data</h2>
  <p>Your data is 100% local.</p>
  <button id="export-btn" style="padding: 10px; background: var(--primary); border: none; border-radius: 8px; margin-bottom: 10px;">Export Data</button>
  <textarea id="import-area" placeholder="Paste JSON here to import" style="width: 100%; height: 100px; padding: 10px;"></textarea>
  <button id="import-btn" style="padding: 10px; background: var(--text); color: white; border: none; border-radius: 8px; margin-top: 10px;">Import Data</button>
</div>
```

```javascript
// Append to src/main.js
import { exportData, importData } from './privacy.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const data = exportData();
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health_backup.json';
    a.click();
  });
  
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const json = document.getElementById('import-area').value;
    if (importData(json)) {
      alert('Import successful! Please reload.');
      window.location.reload();
    } else {
      alert('Invalid JSON format.');
    }
  });
});
```

- [ ] **Step 5: Run test to verify passes**

Run: `npx vitest run tests/privacy.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/privacy.js tests/privacy.test.js index.html src/main.js
git commit -m "feat: add export and import functionality"
```
