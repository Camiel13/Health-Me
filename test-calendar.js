import { JSDOM } from 'jsdom';
import fs from 'fs';
const html = fs.readFileSync('./index.html', 'utf-8');
const dom = new JSDOM(html, { url: "http://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: () => JSON.stringify({ habits: [], history: [] }),
  setItem: () => {}
};
global.alert = console.log;

import { renderHabits } from './src/main.js';
try {
  renderHabits();
  console.log("Success! No error.");
} catch (e) {
  console.error("ERROR:", e);
}
