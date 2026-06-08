import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';

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
