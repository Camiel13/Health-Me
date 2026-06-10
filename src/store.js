export function initStore() {
  if (!localStorage.getItem('health_app_state')) {
    const defaultState = { 
      history: [], // Array of { date: 'YYYY-MM-DD', foods: [], steps: 0 }
      habits: [], // Array of { id, trigger, action, time, frequency, completions: 0 }
      score: 0,
      avatar: { hat: 'none', item: 'none' },
      isInventoryMode: true,
      goals: null
    };
    localStorage.setItem('health_app_state', JSON.stringify(defaultState));
  } else {
    const state = JSON.parse(localStorage.getItem('health_app_state'));
    if (!state.history) state.history = [];
    if (!state.habits) state.habits = [];
    if (typeof state.score !== 'number') state.score = 0;
    if (!state.avatar) state.avatar = { hat: 'none', item: 'none' };
    if (!state.unlockedHats) state.unlockedHats = ['none'];
    if (typeof state.isInventoryMode === 'undefined') state.isInventoryMode = true;
    if (typeof state.goals === 'undefined') state.goals = null;
    state.habits = state.habits.map(h => ({
      ...h,
      completedDates: h.completedDates || [],
      difficulty: h.difficulty || 'Normal',
      slot: h.slot || 'Anytime'
    }));
    localStorage.setItem('health_app_state', JSON.stringify(state));
  }
}

export function getState() {
  return JSON.parse(localStorage.getItem('health_app_state'));
}

export function saveState(state) {
  localStorage.setItem('health_app_state', JSON.stringify(state));
}

export function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayRecord() {
  const state = getState();
  const today = getTodayString();
  if (!state.history) state.history = [];
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
  if (!state.history) state.history = [];
  let record = state.history.find(r => r.date === today);
  if (!record) {
    record = { date: today, foods: [], steps: 0 };
    state.history.push(record);
  }
  
  const existingFood = record.foods.find(f => f.name === food.name);
  if (existingFood) {
    existingFood.calories += (food.calories || 0);
    existingFood.carbs += (food.carbs || 0);
    existingFood.protein += (food.protein || 0);
    existingFood.fat += (food.fat || 0);
    existingFood.fiber += (food.fiber || 0);
    existingFood.sodium += (food.sodium || 0);
    existingFood.count = (existingFood.count || 1) + 1;
    existingFood.timestamp = Date.now();
  } else {
    // Calculate healthScore
    let scorePoints = 10;
    if (food.protein > 15) scorePoints += 2;
    if (food.fiber > 5) scorePoints += 2;
    if (food.calories > 600) scorePoints -= 3;
    if (food.fat > 30) scorePoints -= 2;
    if (food.sodium > 800) scorePoints -= 2;
    
    let healthScore = 'C';
    if (scorePoints >= 12) healthScore = 'A';
    else if (scorePoints >= 10) healthScore = 'B';
    else if (scorePoints >= 8) healthScore = 'C';
    else if (scorePoints >= 6) healthScore = 'D';
    else healthScore = 'F';

    record.foods.push({ ...food, healthScore, timestamp: Date.now(), count: 1 });
  }

  saveState(state);
}

export function getTodayTotals() {
  const record = getTodayRecord();
  const foods = record.foods || [];
  return foods.reduce((totals, food) => {
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
  const today = getTodayString();
  state.habits.push({ 
    ...habit, 
    id: Date.now(), 
    completions: 0,
    completedDates: [],
    createdDate: today
  });
  saveState(state);
}

export function completeHabit(habitId) {
  const state = getState();
  const today = getTodayString();
  const habit = state.habits.find(h => h.id === habitId);
  if (habit) {
    if (!habit.completedDates) habit.completedDates = [];
    if (!habit.completedDates.includes(today)) {
      habit.completedDates.push(today);
      habit.completions++;
      
      let pts = 10;
      if (habit.difficulty === 'Easy') pts = 5;
      if (habit.difficulty === 'Normal') pts = 10;
      if (habit.difficulty === 'Hard') pts = 20;
      
      state.score += pts;
      saveState(state);
    }
  }
}

export function checkNeverMissTwice() {
  const state = getState();
  const today = new Date();
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  
  const habits = state.habits || [];
  const habitsYesterday = habits.filter(h => !h.createdDate || h.createdDate <= yesterday);
  if (habitsYesterday.length === 0) return false;
  
  const completedYesterday = habitsYesterday.filter(h => h.completedDates && h.completedDates.includes(yesterday));
  
  // Trigger if they missed ANY habit yesterday
  return completedYesterday.length < habitsYesterday.length;
}

export function getHabitStreak() {
  const state = getState();
  if (!state.habits || state.habits.length === 0) return 0;
  
  // A generic way to calculate streak: consecutive days where at least ALL habits were completed?
  // Let's do consecutive days where AT LEAST ONE habit was completed for a simple streak.
  let currentStreak = 0;
  let d = new Date();
  
  // Check today first
  let dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let completedOnDate = state.habits.some(h => h.completedDates && h.completedDates.includes(dateStr));
  
  if (completedOnDate) currentStreak++;
  
  // Go backwards from yesterday
  d.setDate(d.getDate() - 1);
  while(true) {
    let ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let comp = state.habits.some(h => h.completedDates && h.completedDates.includes(ds));
    if (comp) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  
  return currentStreak;
}

export function finishInventory() {
  const state = getState();
  const totals = getTodayTotals();
  
  // Calculate customized goals based on eaten macros
  const calories = Math.max(1200, Math.round(totals.calories * 0.85)); // 15% deficit
  const protein = Math.max(50, Math.round((calories * 0.3) / 4)); // 30% protein
  const fat = Math.max(40, Math.round((calories * 0.25) / 9)); // 25% fat
  const carbs = Math.max(100, Math.round((calories * 0.45) / 4)); // 45% carbs
  const fiber = Math.max(25, Math.round(calories / 1000 * 14));
  const sodium = 2300;

  state.goals = { calories, protein, fat, carbs, fiber, sodium };
  state.isInventoryMode = false;
  saveState(state);
  return state.goals;
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
