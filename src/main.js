import { searchFood } from './api.js';
import { initScanner } from './scanner.js';

document.addEventListener('DOMContentLoaded', () => {
  initScanner();
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
