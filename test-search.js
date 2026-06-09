const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const scriptCode = fs.readFileSync('src/main.js', 'utf8');
const apiCode = fs.readFileSync('src/api.js', 'utf8');

// A fake DOM just to see if executeSearch exists
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Fake API fetch
window.fetch = async () => ({
  json: async () => ({ products: [{ product_name: "Apple", nutriments: {} }] })
});

// Run API code
const scriptElApi = window.document.createElement("script");
scriptElApi.textContent = apiCode.replace(/export /g, '');
window.document.body.appendChild(scriptElApi);

// Run Main code
const scriptElMain = window.document.createElement("script");
// Strip imports
scriptElMain.textContent = scriptCode.replace(/import .*/g, '');
window.document.body.appendChild(scriptElMain);

setTimeout(() => {
  console.log("executeSearch typeof:", typeof window.executeSearch);
  const searchBtn = window.document.getElementById('search-btn');
  console.log("Button has onclick attribute?", searchBtn.hasAttribute('onclick'));
}, 500);

