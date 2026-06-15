import { searchFood } from './api.js';
import { initScanner } from './scanner.js';
import { exportData, importData } from './privacy.js';
import { addFood, getTodayTotals, getTodayRecord, addHabit, completeHabit, getState, initStore, updateProfile, buyHat, finishInventory, checkNeverMissTwice, getHabitStreak, getTodayString, cleanData, resetProgress } from './store.js';

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

function animateValue(id, start, end, duration, suffix = '') {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

window.finishInventoryDay = function() {
  const newGoals = finishInventory();
  renderDashboard();
  
  const modal = document.getElementById('goals-modal');
  const goalsContent = document.getElementById('goals-summary-content');
  if (modal && goalsContent) {
    goalsContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div class="glass-card macro-reveal-card" style="padding: 16px; text-align: center; background: rgba(255,255,255,0.65); border: 1px solid rgba(130,207,160,0.25); animation-delay: 0.1s; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 8px 20px rgba(30, 54, 45, 0.04);">
          <span style="font-size: 24px;">🔥</span>
          <span style="font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Calories</span>
          <span id="reveal-calories" style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text);">0</span>
        </div>
        <div class="glass-card macro-reveal-card" style="padding: 16px; text-align: center; background: rgba(255,255,255,0.65); border: 1px solid rgba(130,207,160,0.25); animation-delay: 0.25s; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 8px 20px rgba(30, 54, 45, 0.04);">
          <span style="font-size: 24px;">🥩</span>
          <span style="font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Protein</span>
          <span id="reveal-protein" style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text);">0g</span>
        </div>
        <div class="glass-card macro-reveal-card" style="padding: 16px; text-align: center; background: rgba(255,255,255,0.65); border: 1px solid rgba(130,207,160,0.25); animation-delay: 0.4s; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 8px 20px rgba(30, 54, 45, 0.04);">
          <span style="font-size: 24px;">🌾</span>
          <span style="font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Carbs</span>
          <span id="reveal-carbs" style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text);">0g</span>
        </div>
        <div class="glass-card macro-reveal-card" style="padding: 16px; text-align: center; background: rgba(255,255,255,0.65); border: 1px solid rgba(130,207,160,0.25); animation-delay: 0.55s; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 8px 20px rgba(30, 54, 45, 0.04);">
          <span style="font-size: 24px;">🥑</span>
          <span style="font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Fat</span>
          <span id="reveal-fat" style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text);">0g</span>
        </div>
      </div>
    `;
    modal.style.display = 'block';
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.classList.add('reveal-active');
      setTimeout(() => animateValue('reveal-calories', 0, newGoals.calories, 1000), 100);
      setTimeout(() => animateValue('reveal-protein', 0, newGoals.protein, 1000, 'g'), 250);
      setTimeout(() => animateValue('reveal-carbs', 0, newGoals.carbs, 1000, 'g'), 400);
      setTimeout(() => animateValue('reveal-fat', 0, newGoals.fat, 1000, 'g'), 550);
    }, 10);
  } else {
    alert("Plan Generated!");
  }
};

window.closeGoalsModal = function() {
  const modal = document.getElementById('goals-modal');
  if (modal) {
    modal.classList.remove('reveal-active');
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
  }
};

window.dismissInventoryOnboarding = function() {
  const modal = document.getElementById('inventory-onboarding-modal');
  if (modal) {
    modal.style.opacity = '0';
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
  const sBtn = document.getElementById('search-btn');
  if (sInput && sResults) {
    if (!sInput.contains(e.target) && !sResults.contains(e.target) && (!sBtn || !sBtn.contains(e.target))) {
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

  let currentReflectionHabitId = null;

  window.openReflectionModal = function(id) {
    currentReflectionHabitId = id;
    const input = document.getElementById('reflection-input');
    const countDisplay = document.getElementById('reflection-word-count');
    const submitBtn = document.getElementById('submit-reflection-btn');
    if(input) input.value = '';
    if(countDisplay) countDisplay.textContent = '0 / 10 words';
    if(submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }
    document.getElementById('habit-reflection-modal').style.display = 'flex';
  };

  document.getElementById('reflection-input')?.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const countDisplay = document.getElementById('reflection-word-count');
    const submitBtn = document.getElementById('submit-reflection-btn');
    
    countDisplay.textContent = `${words} / 10 words`;
    
    if (words >= 10) {
      countDisplay.style.color = 'var(--primary)';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    } else {
      countDisplay.style.color = '#888';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }
  });

  document.getElementById('submit-reflection-btn')?.addEventListener('click', () => {
    if (currentReflectionHabitId) {
      const text = document.getElementById('reflection-input').value.trim();
      completeHabit(currentReflectionHabitId, text);
      document.getElementById('habit-reflection-modal').style.display = 'none';
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



window.currentCalendarDate = window.currentCalendarDate || new Date();
window.selectedCalendarDate = window.selectedCalendarDate || new Date();

window.changeCalendarMonth = function(offset) {
  window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() + offset);
  renderHabits();
};

window.selectCalendarDay = function(y, m, d) {
  window.selectedCalendarDate = new Date(y, m, d);
  renderHabits();
};

export function renderHabits() {
  window.currentCalendarDate = window.currentCalendarDate || new Date();
  window.selectedCalendarDate = window.selectedCalendarDate || new Date();
  
  const state = getState();
  const list = document.getElementById('habits-list');
  
  const banner = document.getElementById('never-miss-twice-banner');
  if (banner) {
    banner.style.display = checkNeverMissTwice() ? 'block' : 'none';
  }
  
  const streakDisplay = document.getElementById('current-streak-display');
  if (streakDisplay) {
    streakDisplay.textContent = getHabitStreak();
  }
  
  const calGrid = document.getElementById('full-month-calendar');
  const monthYearDisplay = document.getElementById('cal-month-year');
  if (calGrid && monthYearDisplay) {
    const year = window.currentCalendarDate.getFullYear();
    const month = window.currentCalendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    let html = '';
    
    const selY = window.selectedCalendarDate.getFullYear();
    const selM = window.selectedCalendarDate.getMonth();
    const selD = window.selectedCalendarDate.getDate();
    
    const today = new Date();
    
    let dayCount = 1;
    let nextMonthDay = 1;
    
    for (let i = 0; i < 42; i++) {
      let isCurrentMonth = true;
      let d = 0;
      let m = month;
      let y = year;
      
      if (i < startDayOfWeek) {
        isCurrentMonth = false;
        d = prevMonthLastDay - startDayOfWeek + i + 1;
        m = month - 1;
      } else if (dayCount > lastDay.getDate()) {
        isCurrentMonth = false;
        d = nextMonthDay++;
        m = month + 1;
      } else {
        d = dayCount++;
      }
      
      const realDate = new Date(y, m, d);
      const isSelected = (realDate.getFullYear() === selY && realDate.getMonth() === selM && realDate.getDate() === selD);
      const isToday = (realDate.getFullYear() === today.getFullYear() && realDate.getMonth() === today.getMonth() && realDate.getDate() === today.getDate());
      
      const ds = `${realDate.getFullYear()}-${String(realDate.getMonth() + 1).padStart(2, '0')}-${String(realDate.getDate()).padStart(2, '0')}`;
      
      const didAny = state.habits && state.habits.some(h => h.completedDates && h.completedDates.includes(ds));
      const hasFood = state.history && state.history.some(r => r.date === ds && r.foods.length > 0);
      
      let indicator = '';
      if (didAny || hasFood) {
        indicator = `<div style="width:4px; height:4px; border-radius:50%; background: ${isSelected ? 'white' : 'var(--primary)'}; margin-top:2px;"></div>`;
      }
      
      html += `
        <div onclick="window.selectCalendarDay(${realDate.getFullYear()}, ${realDate.getMonth()}, ${realDate.getDate()})" 
             style="cursor: pointer; padding: 8px 0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
             ${!isCurrentMonth ? 'opacity: 0.3;' : ''}
             ${isSelected ? 'background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: 0 4px 10px rgba(130,207,160,0.4);' : (isToday ? 'border: 1px solid var(--primary); color: var(--primary);' : 'background: rgba(255,255,255,0.4);')}
             ">
          <span style="font-weight: 600; font-size: 14px;">${d}</span>
          ${indicator}
        </div>
      `;
    }
    calGrid.innerHTML = html;
  }
  
  const selDs = `${window.selectedCalendarDate.getFullYear()}-${String(window.selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(window.selectedCalendarDate.getDate()).padStart(2, '0')}`;
  
  const titleDisplay = document.getElementById('selected-day-title');
  if (titleDisplay) {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (selDs === todayStr) {
      titleDisplay.textContent = "Today's Overview";
    } else {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      titleDisplay.textContent = window.selectedCalendarDate.toLocaleDateString(undefined, options);
    }
  }
  
  const macrosContainer = document.getElementById('selected-day-macros');
  const foodsContainer = document.getElementById('selected-day-foods');
  const habitsContainer = document.getElementById('selected-day-habits');
  
  if (macrosContainer && foodsContainer && habitsContainer) {
    const history = state.history || [];
    const record = history.find(r => r.date === selDs);
    
    if (!record || !record.foods || record.foods.length === 0) {
      macrosContainer.innerHTML = '<div style="grid-column: 1 / -1; color: #888; font-size: 14px; padding: 10px; background: rgba(0,0,0,0.02); border-radius: 12px; text-align: center;">No food logged.</div>';
      foodsContainer.innerHTML = '<li><small style="color: #666;">No foods logged.</small></li>';
    } else {
      const totals = record.foods.reduce((acc, f) => {
        acc.cal += f.calories || 0; acc.pro += f.protein || 0; acc.carb += f.carbs || 0; acc.fat += f.fat || 0; return acc;
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
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.7); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02);">
          <div style="display: flex; flex-direction: column;">
            <strong style="font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text);">${f.name}</strong>
            <span style="font-size: 11px; color: #aaa;">${Math.round(f.protein||0)}g P · ${Math.round(f.carbs||0)}g C · ${Math.round(f.fat||0)}g F</span>
          </div>
          <strong style="color: var(--primary); font-size: 14px;">${Math.round(f.calories)} kcal</strong>
        </li>
      `).join('');
    }
    
    const completedHabits = (state.habits || []).filter(h => h.completedDates && h.completedDates.includes(selDs));
    if (completedHabits.length === 0) {
      habitsContainer.innerHTML = '<li><small style="color: #666;">No habits completed.</small></li>';
    } else {
      habitsContainer.innerHTML = completedHabits.map(h => {
        const reflection = h.reflections && h.reflections[selDs] ? h.reflections[selDs] : '';
        return `
        <li style="display: flex; flex-direction: column; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02); margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">✓</div>
            <strong style="font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text);">${h.action}</strong>
          </div>
          ${reflection ? `<p style="margin: 8px 0 0 34px; font-size: 12px; color: var(--text-light); font-style: italic; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 8px;">"${reflection}"</p>` : ''}
        </li>
      `}).join('');
    }
  }

  const todayStr = getTodayString();
  if(!list) return;

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
      <button onclick="window.openReflectionModal(${h.id})" ${isCompletedToday ? 'disabled' : ''} style="padding: 8px 16px; background: ${isCompletedToday ? '#ccc' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))'}; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: ${isCompletedToday ? 'default' : 'pointer'}; font-family: 'Inter', sans-serif; box-shadow: ${isCompletedToday ? 'none' : '0 4px 10px rgba(130,207,160,0.3)'}; transition: transform 0.2s; min-width: 80px;">
        ${isCompletedToday ? 'Done' : 'Complete'}
      </button>
    </li>
  `}).join('');
}

export function renderMiniCalendar() {
  const container = document.getElementById('mini-calendar-container');
  if (!container) return;
  
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let html = '<div class="mini-calendar">';
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Check if this date has any history in store
    const state = getState();
    const isLogged = state.history && state.history.some(h => h.date === dateStr && h.foods && h.foods.length > 0);
    
    const isToday = d.toDateString() === today.toDateString();
    
    html += `
      <div class="mini-calendar-day ${isToday ? 'active' : ''} ${isLogged ? 'logged' : ''}">
        <span class="day-label">${days[i]}</span>
        <div class="day-bubble">
          ${d.getDate()}
          <div class="dot"></div>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
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
  
  renderMiniCalendar();

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
    const getMacroBox = (icon, label, value, max, color, unit = 'g', delayIndex = 0) => {
      let pct = Math.min((value / max) * 100, 100);
      if (isNaN(pct)) pct = 0;
      return `
  <div class="macro-box-animated" style="flex-shrink: 0; width: 65px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.6); padding: 10px 4px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); animation-delay: ${delayIndex * 0.08}s;">
    <span style="font-size: 18px; margin-bottom: 4px;">${icon}</span>
    <span style="font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 800; color: var(--text);">${Math.round(value)}<span style="font-size: 9px; color: var(--text-light); font-weight: 600;">/${Math.round(max)}</span></span>
    <span style="font-size: 9px; font-weight: 700; color: var(--text-light); text-transform: uppercase; margin-top: 2px;">${label}</span>
  </div>`;
    };
    
    diffsContainer.innerHTML = `
      ${getMacroBox('🥩', 'Protein', totals.protein, goals.protein, '#ff7043', 'g', 0)}
      ${getMacroBox('🌾', 'Carbs', totals.carbs, goals.carbs, '#ffca28', 'g', 1)}
      ${getMacroBox('🥑', 'Fats', totals.fat, goals.fat, '#66bb6a', 'g', 2)}
      ${getMacroBox('🥦', 'Fiber', totals.fiber, goals.fiber, '#29b6f6', 'g', 3)}
      ${getMacroBox('🧂', 'Sodium', totals.sodium, goals.sodium || 2300, '#ab47bc', 'mg', 4)}
    `;
  }
  
  // Inventory Day Premium Card & Onboarding
  const inventoryCard = document.getElementById('inventory-premium-card');
  const onboardingModal = document.getElementById('inventory-onboarding-modal');
  
  if (state.isInventoryMode) {
    if (inventoryCard) inventoryCard.style.display = 'block';
    
    if (onboardingModal && !window.inventoryOnboardingSeen) {
      onboardingModal.style.display = 'flex';
      setTimeout(() => {
        onboardingModal.style.opacity = '1';
        onboardingModal.style.transition = 'opacity 0.3s ease';
      }, 50);
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
    const foods = record.foods || [];
    if (foods.length === 0) {
      list.innerHTML = '<li><small style="color: #666;">No foods logged today.</small></li>';
    } else {
      list.innerHTML = foods.map((f, index) => `
        <li class="reveal-item" style="transition-delay: ${index * 0.05}s; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,0.8);">
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

  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        } else {
          entry.target.classList.remove('reveal-active');
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -20px 0px"
    });
  
    document.querySelectorAll('.reveal-item').forEach(item => {
      observer.observe(item);
    });
  }, 100);
}
window.renderDashboard = renderDashboard;

window.resetProgress = function() {
  if (confirm("Are you sure you want to completely reset all your progress back to the showcase data?")) {
    resetProgress();
    window.location.reload();
  }
};

window.cleanData = function() {
  if (confirm("Are you sure you want to delete all showcase data and start with a completely empty database?")) {
    cleanData();
    window.location.reload();
  }
};

function showShowcaseAnimation() {
  const overlay = document.createElement('div');
  overlay.className = 'keybind-overlay showcase-load-overlay';
  overlay.innerHTML = `
    <div class="keybind-icon showcase-icon-card">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.5S2 11.5 2 13.5s1.75 3.75 1.75 3.75"/>
      </svg>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    window.location.reload();
  }, 900);
}

function showCleanAnimation() {
  const overlay = document.createElement('div');
  overlay.className = 'keybind-overlay clean-load-overlay';
  overlay.innerHTML = `
    <div class="clean-wipe-line"></div>
    <div class="keybind-icon clean-icon-card">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.278L21 12l-5.816 1.91a2 2 0 0 0-1.275 1.278L12 21l-1.91-5.812a2 2 0 0 0-1.277-1.278L3 12l5.813-1.91a2 2 0 0 0 1.278-1.277L12 3z"/>
      </svg>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    window.location.reload();
  }, 900);
}


window.addEventListener('keydown', (e) => {
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
    return;
  }
  if (e.altKey && e.shiftKey) {
    const key = e.key.toLowerCase();
    if (key === 'd') {
      e.preventDefault();
      resetProgress();
      showShowcaseAnimation();
    } else if (key === 'c') {
      e.preventDefault();
      cleanData();
      showCleanAnimation();
    }
  }
});

console.log("🛠️ Dev Tools: Press Alt+Shift+D to load showcase data, or Alt+Shift+C to start completely clean.");

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
