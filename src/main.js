import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  initScanner();
  const searchBtn = document.getElementById('search-btn');
  if(searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const query = document.getElementById('food-search').value;
      const results = await searchFood(query);
      const list = document.getElementById('search-results');
      list.innerHTML = '';
      results.forEach(r => {
        const li = document.createElement('li');
        li.style.cssText = 'padding: 10px; background: white; margin-bottom: 8px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
        
        const info = document.createElement('div');
        info.innerHTML = `<strong>${r.name}</strong><br><small>${r.calories} kcal | ${r.protein}g P | ${r.carbs}g C | ${r.fat}g F</small>`;
        
        const btn = document.createElement('button');
        btn.textContent = '+ Add';
        btn.style.cssText = 'padding: 6px 12px; background: var(--primary); border: none; border-radius: 6px; font-weight: bold; cursor: pointer;';
        btn.onclick = () => {
          addFood(r);
          alert(`Added ${r.name}!`);
          renderDashboard();
        };
        
        li.appendChild(info);
        li.appendChild(btn);
        list.appendChild(li);
      });
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
