import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord, addHabit, completeHabit, getState, initStore, updateProfile } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  initStore();
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
          // Graceful error fallback, e.g. when OFC API is down or cors fails
          searchResults.innerHTML = '<li style="padding: 15px; color: #888; text-align: center;">Unable to connect to food database.</li>';
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

  document.getElementById('save-habit-btn')?.addEventListener('click', () => {
    const trigger = document.getElementById('habit-trigger').value.trim();
    const action = document.getElementById('habit-action').value.trim();
    const time = document.getElementById('habit-time').value;
    const freq = document.getElementById('habit-freq').value;
    if(trigger && action) {
      addHabit({ trigger, action, time, frequency: freq });
      document.getElementById('habit-form-modal').style.display = 'none';
      document.getElementById('habit-trigger').value = '';
      document.getElementById('habit-action').value = '';
      document.getElementById('habit-time').value = '';
      renderHabits();
      alert('Habit saved!');
    } else {
      alert('Please fill in both Trigger and Action.');
    }
  });

  document.getElementById('save-profile-btn')?.addEventListener('click', () => {
    const newName = document.getElementById('profile-name').value.trim();
    const hat = document.getElementById('profile-hat').value;
    updateProfile(newName || 'You', hat);
    renderScoreboard();
    renderProfile();
    alert('Profile saved!');
  });

  renderDashboard();
  renderHabits();
  renderProfile();
  renderScoreboard();
});

export function getAvatarSvg(hat) {
  let hatSvg = '';
  if (hat === 'cap') {
    hatSvg = '<path d="M 30 25 Q 50 10 70 25 L 85 25 L 70 32 Z" fill="#FF4500" />';
  } else if (hat === 'crown') {
    hatSvg = '<path d="M 30 25 L 35 5 L 50 15 L 65 5 L 70 25 Z" fill="#FFD700" />';
  }
  return `
    <svg viewBox="0 0 100 100" style="width:100%; height:100%;" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="4"/>
      <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="60" x2="30" y2="45" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="60" x2="70" y2="45" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="80" x2="35" y2="95" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="80" x2="65" y2="95" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      ${hatSvg}
    </svg>
  `;
}

export function renderProfile() {
  const state = getState();
  const nameInput = document.getElementById('profile-name');
  const hatSelect = document.getElementById('profile-hat');
  const avatarContainer = document.getElementById('profile-avatar-container');
  const nameDisplay = document.getElementById('profile-name-display');
  
  if(nameInput) nameInput.value = state.name || 'You';
  if(nameDisplay) nameDisplay.textContent = state.name || 'You';
  if(hatSelect && state.avatar) hatSelect.value = state.avatar.hat || 'none';
  if(avatarContainer) {
    avatarContainer.innerHTML = getAvatarSvg(state.avatar ? state.avatar.hat : 'none');
    avatarContainer.style.color = 'var(--primary)';
  }
}

window.completeHabitAction = function(id) {
  completeHabit(id);
  renderHabits();
  renderScoreboard();
};

export function renderHabits() {
  const list = document.getElementById('habits-list');
  if(!list) return;
  const state = getState();
  if(!state.habits || state.habits.length === 0) {
    list.innerHTML = '<li><small style="color: #666;">No habits added yet.</small></li>';
    return;
  }
  list.innerHTML = state.habits.map(h => `
    <li style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div>
        <strong style="display: block;">After ${h.trigger}, I will ${h.action}</strong>
        <small style="color: #666;">${h.time ? h.time + ' - ' : ''}${h.frequency} | ${h.completions} completions</small>
      </div>
      <button onclick="completeHabitAction(${h.id})" style="padding: 8px 12px; background: #e6f4ea; color: var(--primary); border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Done!</button>
    </li>
  `).join('');
}

export function renderScoreboard() {
  const scoreDisplay = document.getElementById('user-score-display');
  const nameDisplaySb = document.getElementById('user-name-display-sb');
  const avatarYou = document.getElementById('scoreboard-avatar-you');
  const avatarSarah = document.getElementById('scoreboard-avatar-sarah');
  const avatarMark = document.getElementById('scoreboard-avatar-mark');
  
  const state = getState();
  
  if(scoreDisplay) {
    scoreDisplay.textContent = \`\${state.score || 0} pts\`;
  }
  if(nameDisplaySb) {
    nameDisplaySb.textContent = state.name || 'You';
  }
  if(avatarYou) {
    avatarYou.innerHTML = getAvatarSvg(state.avatar ? state.avatar.hat : 'none');
    avatarYou.style.color = 'var(--primary)';
  }
  if(avatarSarah) {
    avatarSarah.innerHTML = getAvatarSvg('crown');
    avatarSarah.style.color = '#e29578';
  }
  if(avatarMark) {
    avatarMark.innerHTML = getAvatarSvg('cap');
    avatarMark.style.color = '#83c5be';
  }
}

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
