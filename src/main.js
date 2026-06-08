import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  initScanner();
  const searchInput = document.getElementById('food-search');
  const searchResults = document.getElementById('search-results');
  let searchTimeout;

  if(searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (!query) {
        searchResults.innerHTML = '';
        return;
      }

      searchResults.innerHTML = '<li style="text-align:center; padding: 15px; color: #666; display: flex; justify-content: center; align-items: center; gap: 10px;">Loading... <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></li>';
      
      searchTimeout = setTimeout(async () => {
        try {
          const results = await searchFood(query);
          searchResults.innerHTML = '';
          if (results.length === 0) {
            searchResults.innerHTML = '<li style="padding: 15px; color: #666; text-align: center;">No results found</li>';
            return;
          }
          results.forEach(r => {
            const li = document.createElement('li');
            li.style.cssText = 'padding: 10px; background: white; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;';
            
            const info = document.createElement('div');
            info.innerHTML = `<strong>${r.name}</strong><br><small style="color: #666;">${Math.round(r.calories)} kcal | ${Math.round(r.protein)}g P | ${Math.round(r.carbs)}g C | ${Math.round(r.fat)}g F</small>`;
            
            const btn = document.createElement('button');
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            btn.style.cssText = 'padding: 6px; background: var(--primary); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;';
            btn.onclick = () => {
              addFood(r);
              alert(`Added ${r.name}!`);
              renderDashboard();
              searchInput.value = '';
              searchResults.innerHTML = '';
            };
            
            li.appendChild(info);
            li.appendChild(btn);
            searchResults.appendChild(li);
          });
        } catch (err) {
          searchResults.innerHTML = '<li style="padding: 15px; color: red; text-align: center;">Error fetching results</li>';
        }
      }, 500);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.innerHTML = '';
      }
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

  renderDashboard();
});

export function renderDashboard() {
  const totals = getTodayTotals();
  
  // Update UI Elements if they exist
  const calDisplay = document.getElementById('dash-cal-display');
  if (calDisplay) calDisplay.textContent = `${Math.round(totals.calories)}`;
  
  // Update Wheel SVG
  const wheelSvg = document.getElementById('dash-wheel-svg');
  if (wheelSvg) {
    const targetCalories = 2000; // Hardcoded US target for demo
    const pct = Math.min((totals.calories / targetCalories) * 100, 100);
    wheelSvg.style.strokeDasharray = `${pct}, 100`;
  }
  
  // Diffs
  const diffsContainer = document.getElementById('dash-diffs');
  if (diffsContainer) {
    const goals = { carbs: 250, protein: 50, fat: 70, fiber: 28, sodium: 2300 };
    diffsContainer.innerHTML = `
      <div class="diff-card"><strong>Carbs</strong><br>${Math.round(totals.carbs)} / ${goals.carbs}g</div>
      <div class="diff-card"><strong>Protein</strong><br>${Math.round(totals.protein)} / ${goals.protein}g</div>
      <div class="diff-card"><strong>Fat</strong><br>${Math.round(totals.fat)} / ${goals.fat}g</div>
      <div class="diff-card"><strong>Fiber</strong><br>${Math.round(totals.fiber)} / ${goals.fiber}g</div>
    `;
  }
  
  // Today's Food List
  const todaysList = document.getElementById('todays-foods-list');
  if (todaysList) {
    const record = getTodayRecord();
    if (record.foods.length === 0) {
      todaysList.innerHTML = '<li><small style="color: #666;">No foods logged today.</small></li>';
    } else {
      todaysList.innerHTML = record.foods.map(f => `
        <li style="padding: 10px; background: white; margin-bottom: 8px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <strong>${f.name}</strong><span style="float:right; color: var(--primary); font-weight: bold;">${f.calories} kcal</span>
        </li>
      `).join('');
    }
  }
}
window.renderDashboard = renderDashboard;
