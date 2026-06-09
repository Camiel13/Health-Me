const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded fired!");
  setTimeout(() => {
    const btn = dom.window.document.getElementById('search-btn');
    const input = dom.window.document.getElementById('food-search');
    console.log("Btn:", !!btn, "Input:", !!input);
    input.value = "apple";
    console.log("Dispatching click on btn");
    btn.click();
    console.log("Search results HTML after click:", dom.window.document.getElementById('search-results').innerHTML);
  }, 1000);
});
