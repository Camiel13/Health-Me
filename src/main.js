import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord, addHabit, completeHabit, getState, initStore, updateProfile, buyHat, finishInventory, checkNeverMissTwice, getHabitStreak, getTodayString } from './store.js';

window.promptAndAddFood = function(food) {
  const modal = document.getElementById('add-food-modal');
  const title = document.getElementById('add-food-title');
  const servingInfo = document.getElementById('add-food-serving-info');
  const amountInput = document.getElementById('add-food-amount');
  const unitSelect = document.getElementById('add-food-unit');
  const servingOption = document.getElementById('add-food-unit-serving');
  const cancelBtn = document.getElementById('add-food-cancel');
  const confirmBtn = document.getElementById('add-food-confirm');
  
  if(!modal) return;
  
  title.innerText = `Add ${food.name}`;
  amountInput.value = 1;
  unitSelect.value = food.serving_quantity ? 'serving' : 'gram';
  
  if(food.serving_quantity) {
    servingOption.style.display = 'block';
    servingOption.innerText = `Serving(s) (${food.serving_quantity}g)`;
    servingInfo.innerText = `1 serving is ${food.serving_quantity}g`;
    servingInfo.style.display = 'block';
    if(food.serving_size) {
      servingInfo.innerText += ` (${food.serving_size})`;
    }
  } else {
    servingOption.style.display = 'none';
    servingInfo.style.display = 'none';
    amountInput.value = 100;
  }
  
  modal.style.display = 'flex';
  
  const cleanup = () => {
    modal.style.display = 'none';
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
  };
  
  cancelBtn.onclick = cleanup;
  
  confirmBtn.onclick = () => {
    let val = parseFloat(amountInput.value);
    if(isNaN(val) || val <= 0) return alert('Invalid amount');
    
    let multiplier = val / 100;
    if(unitSelect.value === 'serving' && food.serving_quantity) {
      multiplier = (val * food.serving_quantity) / 100;
    }
    
    addFood({
      name: food.name,
      calories: food.calories * multiplier,
      carbs: food.carbs * multiplier,
      protein: food.protein * multiplier,
      fat: food.fat * multiplier,
      fiber: food.fiber * multiplier,
      sodium: food.sodium * multiplier
    });
    
    cleanup();
    renderDashboard();
    
    const searchInput = document.getElementById('food-search');
    const searchResults = document.getElementById('search-results');
    if(searchInput) searchInput.value = '';
    if(searchResults) searchResults.innerHTML = '';
  };
};

window.getSmartSuggestion = function() {
  const totals = getTodayTotals();
  const state = getState();
  const goals = state.goals || { calories: 2000, carbs: 250, protein: 50, fat: 70 };
  
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

window.finishInventoryDay = function() {
  const newGoals = finishInventory();
  renderDashboard();
  
  const modal = document.getElementById('goals-modal');
  const goalsContent = document.getElementById('goals-summary-content');
  if (modal && goalsContent) {
    goalsContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div class="glass-card" style="padding: 16px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-light);">Calories</h4>
          <span style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text);">${newGoals.calories}</span>
        </div>
        <div class="glass-card" style="padding: 16px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-light);">Protein</h4>
          <span style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text);">${newGoals.protein}g</span>
        </div>
        <div class="glass-card" style="padding: 16px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-light);">Carbs</h4>
          <span style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text);">${newGoals.carbs}g</span>
        </div>
        <div class="glass-card" style="padding: 16px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-light);">Fat</h4>
          <span style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text);">${newGoals.fat}g</span>
        </div>
      </div>
    `;
    modal.style.display = 'block';
    setTimeout(() => modal.style.opacity = '1', 10);
  } else {
    alert("Plan Generated!");
  }
};

window.closeGoalsModal = function() {
  const modal = document.getElementById('goals-modal');
  modal.style.opacity = '0';
  setTimeout(() => modal.style.display = 'none', 300);
};

window.dismissInventoryOnboarding = function() {
  const modal = document.getElementById('inventory-onboarding-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';
    setTimeout(() => modal.style.display = 'none', 300);
  }
};

window.startAnalyzing = function() {
  const analyzingModal = document.getElementById('analyzing-modal');
  const analyzingText = document.getElementById('analyzing-text');
  
  if (!analyzingModal || !analyzingText) return;
  
  analyzingModal.style.display = 'flex';
  setTimeout(() => analyzingModal.style.opacity = '1', 10);
  
  analyzingText.textContent = 'Analyzing your macros...';
  
  setTimeout(() => {
    analyzingText.style.opacity = '0';
    setTimeout(() => {
      analyzingText.textContent = 'Calculating caloric baseline...';
      analyzingText.style.opacity = '1';
    }, 300);
  }, 1500);

  setTimeout(() => {
    analyzingText.style.opacity = '0';
    setTimeout(() => {
      analyzingText.textContent = 'Generating personalized targets...';
      analyzingText.style.opacity = '1';
    }, 300);
  }, 3000);

  setTimeout(() => {
    analyzingModal.style.opacity = '0';
    setTimeout(() => {
      analyzingModal.style.display = 'none';
      finishInventoryDay();
    }, 300);
  }, 4500);
};

initStore();
initScanner();
window.executeSearch = async () => {
  const searchInput = document.getElementById('food-search');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;
  const query = searchInput.value.trim();
  if (!query) return;

  searchResults.innerHTML = '<li style="text-align:center; padding: 15px; color: #666; display: flex; justify-content: center; align-items: center; gap: 10px;">Loading... <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></li>';
  
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
      let sizeInfo = r.serving_quantity ? ` (${r.serving_quantity}g)` : '';
      if (r.serving_size && !r.serving_quantity) sizeInfo = ` (${r.serving_size})`;
      
      info.innerHTML = `<strong>${r.name}</strong><span style="color:#888;font-size:12px;">${sizeInfo}</span><br><small style="color: #666;">${Math.round(r.calories)} kcal | ${Math.round(r.protein)}g P | ${Math.round(r.carbs)}g C | ${Math.round(r.fat)}g F <span style="opacity:0.6">(per 100g)</span></small>`;
      
      const btn = document.createElement('button');
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      btn.style.cssText = 'padding: 6px; background: var(--primary); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; min-width:30px; min-height:30px;';
      btn.onclick = () => {
        window.promptAndAddFood(r);
      };
      
      li.appendChild(info);
      li.appendChild(btn);
      searchResults.appendChild(li);
    });
  } catch (err) {
    searchResults.innerHTML = '<li style="padding: 15px; color: #888; text-align: center;">Unable to connect to food database.</li>';
  }
};
    
// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const sInput = document.getElementById('food-search');
  const sResults = document.getElementById('search-results');
  if (sInput && sResults) {
    if (!sInput.contains(e.target) && !sResults.contains(e.target)) {
      sResults.innerHTML = '';
    }
  }
});
  
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
    const slot = document.getElementById('habit-slot').value;
    const difficulty = document.getElementById('habit-difficulty').value;
    if(trigger && action) {
      addHabit({ trigger, action, slot, difficulty });
      document.getElementById('habit-form-modal').style.display = 'none';
      document.getElementById('habit-trigger').value = '';
      document.getElementById('habit-action').value = '';
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
  
  const banner = document.getElementById('never-miss-twice-banner');
  if (banner) {
    banner.style.display = checkNeverMissTwice() ? 'block' : 'none';
  }
  
  const streakDisplay = document.getElementById('current-streak-display');
  if (streakDisplay) {
    streakDisplay.textContent = getHabitStreak();
  }
  
  const weekCalendar = document.getElementById('week-calendar');
  if (weekCalendar) {
    let calHTML = '';
    const today = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    // Generate last 7 days
    for(let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = i === 0;
      
      const didAny = state.habits && state.habits.some(h => h.completedDates && h.completedDates.includes(ds));
      
      calHTML += `
        <div onclick="window.openDailySummary('${ds}')" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <span style="font-size: 11px; font-weight: 700; color: ${isToday ? 'var(--primary-dark)' : 'var(--text-light)'};">${days[d.getDay()]}</span>
          <div style="width: 28px; height: 28px; border-radius: 14px; display: flex; align-items: center; justify-content: center; ${didAny ? 'background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white;' : 'background: rgba(0,0,0,0.05); color: transparent;'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      `;
    }
    
    window.openDailySummary = function(dateStr) {
      const state = getState();
      const record = state.history.find(r => r.date === dateStr);
      
      const modal = document.getElementById('daily-summary-modal');
      const title = document.getElementById('daily-summary-title');
      const macrosContainer = document.getElementById('daily-summary-macros');
      const foodsContainer = document.getElementById('daily-summary-foods');
      
      if (!modal) return;
      
      title.textContent = `Summary: ${dateStr}`;
      
      if (!record || record.foods.length === 0) {
        macrosContainer.innerHTML = '<p style="grid-column: 1 / -1; color: #888; font-size: 14px;">No data logged for this date.</p>';
        foodsContainer.innerHTML = '';
      } else {
        const totals = record.foods.reduce((acc, f) => {
          acc.cal += f.calories || 0;
          acc.pro += f.protein || 0;
          acc.carb += f.carbs || 0;
          acc.fat += f.fat || 0;
          return acc;
        }, { cal: 0, pro: 0, carb: 0, fat: 0 });
        
        macrosContainer.innerHTML = `
          <div style="background: rgba(130, 207, 160, 0.1); padding: 12px; border-radius: 12px; text-align: center;">
            <strong style="font-size: 18px; color: var(--primary);">${Math.round(totals.cal)}</strong><br>
            <span style="font-size: 11px; color: #666;">Calories</span>
          </div>
          <div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 12px; text-align: center;">
            <strong style="font-size: 18px;">${Math.round(totals.pro)}g</strong><br>
            <span style="font-size: 11px; color: #666;">Protein</span>
          </div>
          <div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 12px; text-align: center;">
            <strong style="font-size: 18px;">${Math.round(totals.carb)}g</strong><br>
            <span style="font-size: 11px; color: #666;">Carbs</span>
          </div>
          <div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 12px; text-align: center;">
            <strong style="font-size: 18px;">${Math.round(totals.fat)}g</strong><br>
            <span style="font-size: 11px; color: #666;">Fats</span>
          </div>
        `;
        
        foodsContainer.innerHTML = record.foods.map(f => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${f.healthScore ? `<span class="health-score-badge score-${f.healthScore}" style="font-size: 14px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">${f.healthScore}</span>` : ''}
              <div style="display: flex; flex-direction: column;">
                <strong style="font-family: 'Outfit', sans-serif; font-size: 15px; color: var(--text);">${f.name}</strong>
                ${f.count && f.count > 1 ? `<span style="font-size: 12px; color: #888; font-weight: 600;">${f.count}x Portions</span>` : ''}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
              <span style="color: var(--primary); font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 15px;">${Math.round(f.calories)} kcal</span>
            </div>
          </li>
        `).join('');
      }
      
      modal.style.display = 'flex';
    };
    weekCalendar.innerHTML = calHTML;
  }

  const todayStr = getTodayString();

  if(!state.habits || state.habits.length === 0) {
    list.innerHTML = '<li><small style="color: #666;">No habits added yet.</small></li>';
    return;
  }
  list.innerHTML = state.habits.map(h => {
    const isCompletedToday = h.completedDates && h.completedDates.includes(todayStr);
    
    let difficultyColor = '#4caf50';
    if (h.difficulty === 'Normal') difficultyColor = '#2196f3';
    if (h.difficulty === 'Hard') difficultyColor = '#f44336';
    
    return `
    <li class="glass-card" style="padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; ${isCompletedToday ? 'opacity: 0.7;' : ''}">
      <div style="flex: 1; padding-right: 12px;">
        <strong style="display: block; font-family: 'Outfit', sans-serif; font-size: 16px; color: var(--text); margin-bottom: 4px; ${isCompletedToday ? 'text-decoration: line-through;' : ''}">After ${h.trigger}, I will ${h.action}</strong>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 12px; color: var(--text-light); text-transform: uppercase;">${h.slot || 'Anytime'}</span>
          <span style="font-size: 11px; font-weight: 700; background: ${difficultyColor}20; color: ${difficultyColor}; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;">${h.difficulty || 'Normal'}</span>
        </div>
      </div>
      <button onclick="completeHabitAction(${h.id})" ${isCompletedToday ? 'disabled' : ''} style="padding: 8px 16px; background: ${isCompletedToday ? '#ccc' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))'}; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: ${isCompletedToday ? 'default' : 'pointer'}; font-family: 'Inter', sans-serif; box-shadow: ${isCompletedToday ? 'none' : '0 4px 10px rgba(130,207,160,0.3)'}; transition: transform 0.2s; min-width: 80px;">
        ${isCompletedToday ? 'Done' : 'Complete'}
      </button>
    </li>
  `}).join('');
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
  const state = getState();
  const goals = state.goals || { calories: 2000, carbs: 250, protein: 50, fat: 70, fiber: 28, sodium: 2300 };
  
  // Update UI Elements if they exist
  const calDisplay = document.getElementById('dash-cal-display');
  if (calDisplay) calDisplay.textContent = `${Math.round(totals.calories)}`;
  
  // Update Wheel SVG
  const wheelSvg = document.getElementById('dash-wheel-svg');
  if (wheelSvg) {
    const targetCalories = goals.calories || 2000;
    const pct = Math.min((totals.calories / targetCalories) * 100, 100);
    wheelSvg.style.strokeDasharray = `${pct}, 100`;
  }
  
  // Diffs
  const diffsContainer = document.getElementById('dash-diffs');
  if (diffsContainer) {
    const getMacroBox = (icon, label, value, max, color) => {
      let pct = Math.min((value / max) * 100, 100);
      if (isNaN(pct)) pct = 0;
      return `
      <div style="position: relative; border-radius: 14px; display: flex; flex-direction: column; align-items: center; text-align: center; background: rgba(255,255,255,0.8); padding: 8px 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <div style="position: absolute; inset: -2px; border-radius: 16px; padding: 2px; background: conic-gradient(${color} ${pct}%, rgba(0,0,0,0.05) ${pct}%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;"></div>
        <span style="font-size: 16px; margin-bottom: 2px;">${icon}</span>
        <strong style="font-size: 13px; color: var(--text); font-family: 'Outfit', sans-serif;">${Math.round(value)}g</strong>
        <span style="font-size: 9px; font-weight: 700; color: #888; text-transform: uppercase;">${label}</span>
      </div>`;
    };
    
    diffsContainer.innerHTML = `
      ${getMacroBox('🥩', 'Protein', totals.protein, goals.protein, '#ff7043')}
      ${getMacroBox('🌾', 'Carbs', totals.carbs, goals.carbs, '#ffca28')}
      ${getMacroBox('🥑', 'Fats', totals.fat, goals.fat, '#66bb6a')}
      ${getMacroBox('🥦', 'Fiber', totals.fiber, goals.fiber, '#29b6f6')}
    `;
  }
  
  // Inventory Day Premium Card & Onboarding
  const inventoryCard = document.getElementById('inventory-premium-card');
  const onboardingModal = document.getElementById('inventory-onboarding-modal');
  
  if (state.isInventoryMode) {
    if (inventoryCard) inventoryCard.style.display = 'block';
    
    if (onboardingModal && !window.inventoryOnboardingSeen) {
      onboardingModal.style.display = 'flex';
      window.inventoryOnboardingSeen = true;
    }
  } else {
    if (inventoryCard) inventoryCard.style.display = 'none';
    if (onboardingModal) onboardingModal.style.display = 'none';
  }

  // Today's Food List
  const todaysLists = document.querySelectorAll('.todays-foods-list-container');
  todaysLists.forEach(list => {
    const record = getTodayRecord();
    if (record.foods.length === 0) {
      list.innerHTML = '<li><small style="color: #666;">No foods logged today.</small></li>';
    } else {
      list.innerHTML = record.foods.map(f => `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: rgba(255,255,255,0.7); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${f.healthScore ? `<span class="health-score-badge score-${f.healthScore}" style="font-size: 14px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">${f.healthScore}</span>` : ''}
            <div style="display: flex; flex-direction: column;">
              <strong style="font-family: 'Outfit', sans-serif; font-size: 15px; color: var(--text);">${f.name}</strong>
              ${f.count && f.count > 1 ? `<span style="font-size: 12px; color: #888; font-weight: 600;">${f.count}x Portions</span>` : ''}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end;">
            <span style="color: var(--primary); font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 15px;">${Math.round(f.calories)} kcal</span>
            <span style="font-size: 11px; color: #aaa; font-family: 'Inter', sans-serif;">${Math.round(f.protein||0)}g P · ${Math.round(f.carbs||0)}g C · ${Math.round(f.fat||0)}g F</span>
          </div>
        </li>
      `).join('');
    }
  });
}
window.renderDashboard = renderDashboard;

window.resetProgress = function() {
  if (confirm("Are you sure you want to completely reset all your progress, history, and settings? This cannot be undone.")) {
    localStorage.removeItem('health_app_state');
    window.location.reload();
  }
};
console.log("🛠️ Dev Tools: Type 'resetProgress()' to completely wipe all data and start over.");

// Environment Priming Tips
const envTips = [
  "Put your chips in the basement. Out of sight, out of mind.",
  "Place a fruit bowl on the kitchen table.",
  "2-minute rule: chop veggies now so they are ready later.",
  "Use smaller plates to naturally control portion sizes.",
  "Keep a water bottle on your desk at all times.",
  "Hide the junk food in opaque containers, put healthy snacks in clear ones.",
  "Pre-portion your snacks into small baggies when you get back from the store.",
  "Every small step counts towards your big goal.",
  "You are what you eat, so don't be fast, cheap, easy, or fake.",
  "Take care of your body. It's the only place you have to live.",
  "Discipline is choosing between what you want now and what you want most.",
  "It's not a short-term diet. It's a long-term lifestyle change.",
  "Don't let a stumble in the road be the end of the journey.",
  "Focus on progress, not perfection.",
  "The hardest part is starting. You got this.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "Fall in love with taking care of your body.",
  "Strive for progress, not perfection.",
  "Your diet is a bank account. Good food choices are good investments.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "When you feel like quitting, remember why you started.",
  "Eat to nourish your body, not to feed your emotions.",
  "Make time for your health now, or you'll have to make time for illness later."
];

function updateEnvTip() {
  const tipText = document.getElementById('env-tip-text');
  if (tipText) {
    const randomTip = envTips[Math.floor(Math.random() * envTips.length)];
    tipText.style.opacity = '0';
    setTimeout(() => {
      tipText.textContent = '"' + randomTip + '"';
      tipText.style.opacity = '1';
    }, 300);
  }
}

// Generate Grocery List
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-groceries-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const state = getState();
      const goals = state.goals || { calories: 2000, carbs: 250, protein: 50, fat: 70 };
      
      const proteins = [];
      const carbs = [];
      const fats = [];
      
      // Smart logic based on goals
      if (goals.protein > 100) {
        proteins.push('Chicken Breast (High Protein)', 'Greek Yogurt', 'Protein Powder', 'Eggs', 'Lean Ground Beef');
      } else {
        proteins.push('Chicken Thighs', 'Tofu', 'Eggs', 'Lentils');
      }
      
      if (goals.carbs < 150) {
        carbs.push('Zucchini (Low Carb)', 'Cauliflower Rice', 'Berries', 'Broccoli', 'Spinach');
      } else {
        carbs.push('Sweet Potatoes', 'Brown Rice', 'Oats', 'Bananas', 'Whole Wheat Bread');
      }
      
      if (goals.fat < 50) {
        fats.push('Almonds (Portion Controlled)', 'Avocado', 'Olive Oil Spray');
      } else {
        fats.push('Peanut Butter', 'Olive Oil', 'Avocado', 'Mixed Nuts', 'Cheese');
      }

      const proteinList = document.getElementById('grocery-proteins');
      const carbList = document.getElementById('grocery-carbs');
      const fatList = document.getElementById('grocery-fats');
      
      proteinList.innerHTML = proteins.map(i => `<li><label style="display: flex; align-items: center; gap: 8px; font-size: 15px;"><input type="checkbox" style="width: 18px; height: 18px; accent-color: var(--primary);"> ${i}</label></li>`).join('');
      carbList.innerHTML = carbs.map(i => `<li><label style="display: flex; align-items: center; gap: 8px; font-size: 15px;"><input type="checkbox" style="width: 18px; height: 18px; accent-color: var(--primary);"> ${i}</label></li>`).join('');
      fatList.innerHTML = fats.map(i => `<li><label style="display: flex; align-items: center; gap: 8px; font-size: 15px;"><input type="checkbox" style="width: 18px; height: 18px; accent-color: var(--primary);"> ${i}</label></li>`).join('');
      
      const container = document.getElementById('grocery-list-container');
      container.style.display = 'block';
      generateBtn.textContent = 'Refresh List';
      
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#84fab0', '#8fd3f4']
        });
      }
    });
  }
  
  // Rotate tip occasionally
  setInterval(updateEnvTip, 10000);
  // Initial tip
  setTimeout(updateEnvTip, 500);
  
  // Navigation active state toggle logic
  setTimeout(() => {
    const originalNav = window.navigateTo;
    if (originalNav) {
      window.navigateTo = function(viewId) {
        originalNav(viewId);
        document.querySelectorAll('.bottom-nav button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.bottom-nav button[onclick*="${viewId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
      };
    }
  }, 100);
});
