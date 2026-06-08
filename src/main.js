
import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord, addHabit, completeHabit, getState, initStore, updateProfile, buyHat } from './store.js';

window.getSmartSuggestion = function() {
  const totals = getTodayTotals();
  const goals = { calories: 2000, carbs: 250, protein: 50, fat: 70 };
  
  const remaining = {
    calories: Math.max(0, goals.calories - totals.calories),
    carbs: Math.max(0, goals.carbs - totals.carbs),
    protein: Math.max(0, goals.protein - totals.protein),
    fat: Math.max(0, goals.fat - totals.fat)
  };

  const hour = new Date().getHours();
  let timeOfDay = 'evening';
  if (hour < 11) timeOfDay = 'morning';
  else if (hour < 16) timeOfDay = 'afternoon';

  const meals = [
    { name: 'Greek Yogurt & Protein Oats', time: 'morning', macros: { protein: 30, carbs: 45, fat: 8, calories: 370 }, icon: '🥣' },
    { name: 'Avocado Toast & Egg Whites', time: 'morning', macros: { protein: 20, carbs: 30, fat: 12, calories: 308 }, icon: '🥑' },
    { name: 'Protein Pancakes', time: 'morning', macros: { protein: 35, carbs: 40, fat: 10, calories: 390 }, icon: '🥞' },
    { name: 'Scrambled Tofu & Spinach', time: 'morning', macros: { protein: 22, carbs: 12, fat: 14, calories: 262 }, icon: '🍳' },
    { name: 'Smoked Salmon Bagel', time: 'morning', macros: { protein: 24, carbs: 45, fat: 12, calories: 384 }, icon: '🥯' },
    { name: 'Fruit Smoothie Bowl', time: 'morning', macros: { protein: 15, carbs: 55, fat: 8, calories: 352 }, icon: '🫐' },
    
    { name: 'Grilled Chicken Salad', time: 'afternoon', macros: { protein: 40, carbs: 15, fat: 10, calories: 310 }, icon: '🥗' },
    { name: 'Turkey & Cheese Wrap', time: 'afternoon', macros: { protein: 35, carbs: 40, fat: 15, calories: 435 }, icon: '🌯' },
    { name: 'Quinoa & Black Bean Bowl', time: 'afternoon', macros: { protein: 18, carbs: 60, fat: 8, calories: 384 }, icon: '🍲' },
    { name: 'Tuna Salad Sandwich', time: 'afternoon', macros: { protein: 32, carbs: 38, fat: 12, calories: 388 }, icon: '🥪' },
    { name: 'Lentil Soup & Sourdough', time: 'afternoon', macros: { protein: 20, carbs: 55, fat: 5, calories: 345 }, icon: '🥣' },
    { name: 'Chicken Poke Bowl', time: 'afternoon', macros: { protein: 38, carbs: 50, fat: 14, calories: 478 }, icon: '🍱' },
    
    { name: 'Baked Salmon & Asparagus', time: 'evening', macros: { protein: 35, carbs: 10, fat: 20, calories: 360 }, icon: '🐟' },
    { name: 'Lean Beef Stir-fry', time: 'evening', macros: { protein: 30, carbs: 35, fat: 12, calories: 368 }, icon: '🥩' },
    { name: 'Vegetarian Chili', time: 'evening', macros: { protein: 22, carbs: 45, fat: 6, calories: 322 }, icon: '🍲' },
    { name: 'Chicken Parmesan & Zucchini', time: 'evening', macros: { protein: 42, carbs: 20, fat: 18, calories: 410 }, icon: '🍝' },
    { name: 'Pork Tenderloin & Sweet Potato', time: 'evening', macros: { protein: 36, carbs: 40, fat: 10, calories: 394 }, icon: '🍠' },
    { name: 'Shrimp Tacos', time: 'evening', macros: { protein: 28, carbs: 35, fat: 12, calories: 360 }, icon: '🌮' },
    
    { name: 'Protein Shake & Almonds', time: 'any', macros: { protein: 25, carbs: 10, fat: 15, calories: 275 }, icon: '🥤' },
    { name: 'Cottage Cheese & Berries', time: 'any', macros: { protein: 28, carbs: 15, fat: 5, calories: 217 }, icon: '🍓' },
    { name: 'Apple & Peanut Butter', time: 'any', macros: { protein: 8, carbs: 25, fat: 16, calories: 276 }, icon: '🍎' },
    { name: 'Edamame Beans', time: 'any', macros: { protein: 17, carbs: 15, fat: 8, calories: 188 }, icon: '🌿' },
    { name: 'Hard Boiled Eggs & Carrots', time: 'any', macros: { protein: 14, carbs: 10, fat: 10, calories: 186 }, icon: '🥚' }
  ];

  let candidates = meals.filter(m => m.time === timeOfDay || m.time === 'any');
  if (candidates.length === 0) candidates = meals;
  
  const needCarbs = goals.carbs > 0 ? remaining.carbs / goals.carbs : 0;
  const needProtein = goals.protein > 0 ? remaining.protein / goals.protein : 0;
  const needFat = goals.fat > 0 ? remaining.fat / goals.fat : 0;
  
  let bestMeal = candidates[0];
  let bestScore = -Infinity;

  candidates.forEach(meal => {
    let score = (Math.random() * 25); // Increased randomness for high variety
    if (meal.macros.calories <= remaining.calories + 100) {
      score += 10;
    }
    
    if (needProtein >= needCarbs && needProtein >= needFat) {
      score += meal.macros.protein;
    } else if (needCarbs >= needProtein && needCarbs >= needFat) {
      score += meal.macros.carbs;
    } else {
      score += meal.macros.fat;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMeal = meal;
    }
  });

  const nameEl = document.getElementById('smart-meal-name');
  const macrosEl = document.getElementById('smart-meal-macros');
  const iconEl = document.getElementById('smart-meal-icon');

  if (nameEl) {
    nameEl.style.transition = 'opacity 0.2s';
    nameEl.style.opacity = 0;
    setTimeout(() => {
      nameEl.textContent = bestMeal.name;
      nameEl.style.opacity = 1;
    }, 200);
  }
  
  if (macrosEl) {
    macrosEl.style.transition = 'opacity 0.2s';
    macrosEl.style.opacity = 0;
    setTimeout(() => {
      macrosEl.textContent = `${bestMeal.macros.calories} kcal | ${bestMeal.macros.protein}g P | ${bestMeal.macros.carbs}g C | ${bestMeal.macros.fat}g F`;
      macrosEl.style.opacity = 1;
    }, 200);
  }
  
  if (iconEl) {
    iconEl.style.transform = 'scale(0)';
    setTimeout(() => {
      iconEl.textContent = bestMeal.icon;
      iconEl.style.transform = 'scale(1)';
    }, 200);
  }
};

window.openShopModal = function() {
  const backdrop = document.getElementById('shop-backdrop');
  backdrop.style.display = 'block';
  // Small timeout to allow display:block to apply before animating opacity
  setTimeout(() => backdrop.style.opacity = '1', 10);
};

window.closeShopModal = function() {
  const backdrop = document.getElementById('shop-backdrop');
  backdrop.style.opacity = '0';
  setTimeout(() => backdrop.style.display = 'none', 300);
};

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

  document.querySelectorAll('.buy-hat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hat = e.target.getAttribute('data-hat');
      const cost = parseInt(e.target.getAttribute('data-cost'));
      if (buyHat(hat, cost)) {
        alert('Item unlocked! Go to Profile to equip it.');
        renderScoreboard();
        renderProfile();
        window.closeShopModal();
      } else {
        const state = getState();
        if (state.unlockedHats?.includes(hat)) {
          alert('You already own this item!');
        } else {
          alert('Not enough points!');
        }
      }
    });
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
  } else if (hat === 'glasses') {
    hatSvg = '<rect x="38" y="30" width="10" height="8" fill="none" stroke="blue" stroke-width="2" rx="2" /><rect x="52" y="30" width="10" height="8" fill="none" stroke="blue" stroke-width="2" rx="2" /><line x1="48" y1="34" x2="52" y2="34" stroke="blue" stroke-width="2" />';
  } else if (hat === 'scarf') {
    hatSvg = '<path d="M 42 48 Q 50 55 58 48 L 55 60 Q 50 65 45 60 Z" fill="green" />';
  } else if (hat === 'chef') {
    hatSvg = '<path d="M 38 22 L 38 10 Q 38 0 50 0 Q 62 0 62 10 L 62 22 Z" fill="white" stroke="#ccc" stroke-width="2" /><rect x="36" y="22" width="28" height="5" fill="white" stroke="#ccc" stroke-width="2" />';
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
  
  if(hatSelect) {
    const unlocked = state.unlockedHats || ['none'];
    const options = [
      { value: 'none', label: 'None' },
      { value: 'cap', label: 'Red Cap' },
      { value: 'crown', label: 'Gold Crown' },
      { value: 'glasses', label: 'Blue Glasses' },
      { value: 'scarf', label: 'Green Scarf' },
      { value: 'chef', label: 'Chef Hat' }
    ];
    hatSelect.innerHTML = options
      .filter(opt => unlocked.includes(opt.value) || opt.value === 'none')
      .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');
    hatSelect.value = state.avatar ? state.avatar.hat : 'none';
  }

  if(avatarContainer) {
    avatarContainer.innerHTML = getAvatarSvg(state.avatar ? state.avatar.hat : 'none');
    avatarContainer.style.color = 'var(--primary)';
  }
}

window.completeHabitAction = function(id) {
  completeHabit(id);
  renderHabits();
  renderScoreboard();
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#82cfa0', '#5b9d74', '#FFD700', '#ffffff']
    });
  }
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
    <li class="glass-card" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="display: block; font-family: 'Outfit', sans-serif; font-size: 16px; color: var(--text);">After ${h.trigger}, I will ${h.action}</strong>
        <small style="color: var(--text-light); font-size: 13px; font-weight: 500;">${h.time ? h.time + ' - ' : ''}${h.frequency} | ${h.completions} completions</small>
      </div>
      <button onclick="completeHabitAction(${h.id})" style="padding: 8px 16px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 4px 10px rgba(130,207,160,0.3); transition: transform 0.2s;">Done!</button>
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
    scoreDisplay.textContent = `${state.score || 0} pts`;
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
      <div class="macro-card macro-carbs">
        <div class="macro-header">
          <span>Carbs</span>
          <div class="macro-icon">🌾</div>
        </div>
        <div class="macro-values">
          <span class="macro-current">${Math.round(totals.carbs)}</span>
          <span class="macro-target">/ ${goals.carbs}g</span>
        </div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width: ${Math.min((totals.carbs/goals.carbs)*100, 100)}%"></div></div>
      </div>
      <div class="macro-card macro-protein">
        <div class="macro-header">
          <span>Protein</span>
          <div class="macro-icon">🥩</div>
        </div>
        <div class="macro-values">
          <span class="macro-current">${Math.round(totals.protein)}</span>
          <span class="macro-target">/ ${goals.protein}g</span>
        </div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width: ${Math.min((totals.protein/goals.protein)*100, 100)}%"></div></div>
      </div>
      <div class="macro-card macro-fat">
        <div class="macro-header">
          <span>Fat</span>
          <div class="macro-icon">🥑</div>
        </div>
        <div class="macro-values">
          <span class="macro-current">${Math.round(totals.fat)}</span>
          <span class="macro-target">/ ${goals.fat}g</span>
        </div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width: ${Math.min((totals.fat/goals.fat)*100, 100)}%"></div></div>
      </div>
      <div class="macro-card macro-fiber">
        <div class="macro-header">
          <span>Fiber</span>
          <div class="macro-icon">🥦</div>
        </div>
        <div class="macro-values">
          <span class="macro-current">${Math.round(totals.fiber)}</span>
          <span class="macro-target">/ ${goals.fiber}g</span>
        </div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width: ${Math.min((totals.fiber/goals.fiber)*100, 100)}%"></div></div>
      </div>
      <div class="macro-card macro-sodium" style="grid-column: span 2;">
        <div class="macro-header">
          <span>Sodium</span>
          <div class="macro-icon">🧂</div>
        </div>
        <div class="macro-values">
          <span class="macro-current">${Math.round(totals.sodium)}</span>
          <span class="macro-target">/ ${goals.sodium}mg</span>
        </div>
        <div class="macro-bar-bg"><div class="macro-bar-fill" style="width: ${Math.min((totals.sodium/goals.sodium)*100, 100)}%"></div></div>
      </div>
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
        <li class="glass-card" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-family: 'Outfit', sans-serif; font-size: 16px; color: var(--text);">${f.name}</strong>
          <span style="color: var(--primary); font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px;">${f.calories} kcal</span>
        </li>
      `).join('');
    }
  }
}
window.renderDashboard = renderDashboard;
