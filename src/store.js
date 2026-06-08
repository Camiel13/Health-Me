export function initStore() {
  if (!localStorage.getItem('health_app_state')) {
    const defaultState = { 
      history: [], // Array of { date: 'YYYY-MM-DD', foods: [], steps: 0 }
      habits: [], // Array of { id, trigger, action, time, frequency, completions: 0 }
      score: 0,
      avatar: { hat: 'none', item: 'none' }
    };
    localStorage.setItem('health_app_state', JSON.stringify(defaultState));
  } else {
    // Migrate old state
    const state = JSON.parse(localStorage.getItem('health_app_state'));
    if (!state.habits) state.habits = [];
    if (typeof state.score !== 'number') state.score = 0;
    if (!state.avatar) state.avatar = { hat: 'none', item: 'none' };
    if (!state.unlockedHats) state.unlockedHats = ['none'];
    localStorage.setItem('health_app_state', JSON.stringify(state));
  }
}

export function getState() {
  return JSON.parse(localStorage.getItem('health_app_state'));
}

export function saveState(state) {
  localStorage.setItem('health_app_state', JSON.stringify(state));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayRecord() {
  const state = getState();
  const today = getTodayString();
  let record = state.history.find(r => r.date === today);
  if (!record) {
    record = { date: today, foods: [], steps: 0 };
    state.history.push(record);
    saveState(state);
  }
  return record;
}

export function addFood(food) {
  const state = getState();
  const today = getTodayString();
  let record = state.history.find(r => r.date === today);
  if (!record) {
    record = { date: today, foods: [], steps: 0 };
    state.history.push(record);
  }
  record.foods.push({ ...food, timestamp: Date.now() });
  saveState(state);
}

export function getTodayTotals() {
  const record = getTodayRecord();
  return record.foods.reduce((totals, food) => {
    totals.calories += (food.calories || 0);
    totals.carbs += (food.carbs || 0);
    totals.protein += (food.protein || 0);
    totals.fat += (food.fat || 0);
    totals.fiber += (food.fiber || 0);
    totals.sodium += (food.sodium || 0);
    return totals;
  }, { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0, steps: record.steps });
}

export function addHabit(habit) {
  const state = getState();
  state.habits.push({ ...habit, id: Date.now(), completions: 0 });
  saveState(state);
}

export function completeHabit(habitId) {
  const state = getState();
  const habit = state.habits.find(h => h.id === habitId);
  if (habit) {
    habit.completions++;
    state.score += 10; // Award 10 points per completion
    saveState(state);
  }
}

export function updateProfile(name, hat) {
  const state = getState();
  state.name = name;
  if (!state.avatar) state.avatar = {};
  state.avatar.hat = hat;
  saveState(state);
}

export function buyHat(hatId, cost) {
  const state = getState();
  if (!state.unlockedHats) state.unlockedHats = ['none'];
  if (state.score >= cost && !state.unlockedHats.includes(hatId)) {
    state.score -= cost;
    state.unlockedHats.push(hatId);
    saveState(state);
    return true;
  }
  return false;
}
