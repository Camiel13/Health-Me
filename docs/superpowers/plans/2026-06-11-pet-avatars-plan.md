# Pet Avatars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vervang de huidige menselijke avatars met een 10-staps evoluerend Pet systeem gebaseerd op SVG's, waarbij Health en XP worden beïnvloed door voeding en routines.

**Architecture:** De data leeft in `store.js` (`state.pet`). SVG rendering gebeurt in `main.js` met een specifieke `getPetSvg(level)` functie. Het dashboard krijgt een UI-component om het huisdier te tonen.

**Tech Stack:** Vanilla JS, HTML, CSS, SVG.

---

### Task 1: Setup Pet State & Logic in Store

**Files:**
- Modify: `src/store.js`

- [ ] **Step 1: Write test for initial Pet State**
```javascript
// tests/store.test.js
import { expect, test, beforeEach } from 'vitest';
import { getState, addPetXP, reducePetHealth, initStore } from '../src/store.js';

beforeEach(() => { localStorage.clear(); initStore(); });

test('Pet initializes correctly', () => {
  const state = getState();
  expect(state.pet).toBeDefined();
  expect(state.pet.level).toBe(1);
  expect(state.pet.xp).toBe(0);
  expect(state.pet.health).toBe(100);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/store.test.js`
Expected: FAIL.

- [ ] **Step 3: Modify initStore and add Pet Logic**
Update `src/store.js`:
```javascript
export function initStore() {
  let state = getState();
  if (!state) {
    state = {
      name: '',
      goals: null,
      isInventoryMode: false,
      history: [],
      habits: [],
      unlockedHats: ['none'],
      avatar: { hat: 'none' },
      score: 0,
      pet: { xp: 0, level: 1, health: 100, lastUpdate: getTodayString() }
    };
    saveState(state);
  } else if (!state.pet) {
    state.pet = { xp: 0, level: 1, health: 100, lastUpdate: getTodayString() };
    saveState(state);
  }
}

export function addPetXP(amount) {
  const state = getState();
  if (!state.pet) return;
  state.pet.xp += amount;
  while (state.pet.xp >= 100 && state.pet.level < 10) {
    state.pet.xp -= 100;
    state.pet.level += 1;
  }
  if (state.pet.level === 10 && state.pet.xp > 100) state.pet.xp = 100;
  saveState(state);
}

export function reducePetHealth(amount) {
  const state = getState();
  if (!state.pet) return;
  state.pet.health = Math.max(0, state.pet.health - amount);
  saveState(state);
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/store.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/store.js tests/store.test.js
git commit -m "feat: add pet state and logic"
```

---

### Task 2: Implement 10 Pet SVG Evolutions

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Write `getPetSvg` function in `main.js`**
Weet dat de gebruiker strakke SVG's wil.
```javascript
export function getPetSvg(level) {
  let inner = '';
  switch(level) {
    case 1: // Mystic Egg
      inner = '<ellipse cx="50" cy="60" rx="30" ry="35" fill="#e0e0e0" stroke="#888" stroke-width="4"/><path d="M 35 45 Q 50 60 65 45" fill="none" stroke="#fff" stroke-width="2"/>'; break;
    case 2: // Hatching
      inner = '<ellipse cx="50" cy="60" rx="30" ry="35" fill="#e0e0e0" stroke="#888" stroke-width="4"/><path d="M 20 60 L 30 50 L 40 65 L 50 45 L 60 60 L 70 45 L 80 60" fill="none" stroke="#333" stroke-width="3"/><circle cx="40" cy="55" r="4" fill="#333"/><circle cx="60" cy="55" r="4" fill="#333"/>'; break;
    case 3: // Baby Blob
      inner = '<circle cx="50" cy="60" r="30" fill="#82cfa0"/><circle cx="40" cy="55" r="5" fill="#1e362d"/><circle cx="60" cy="55" r="5" fill="#1e362d"/><path d="M 45 65 Q 50 70 55 65" fill="none" stroke="#1e362d" stroke-width="3" stroke-linecap="round"/>'; break;
    case 4: // Spiky Blob
      inner = '<path d="M 30 40 L 40 20 L 50 35 L 60 20 L 70 40 Z" fill="#82cfa0"/><circle cx="50" cy="60" r="30" fill="#82cfa0"/><circle cx="40" cy="55" r="5" fill="#1e362d"/><circle cx="60" cy="55" r="5" fill="#1e362d"/><path d="M 45 65 Q 50 70 55 65" fill="none" stroke="#1e362d" stroke-width="3" stroke-linecap="round"/>'; break;
    case 5: // Winged Blob
      inner = '<path d="M 20 50 Q 10 30 25 40 Z" fill="#fff"/><path d="M 80 50 Q 90 30 75 40 Z" fill="#fff"/><circle cx="50" cy="60" r="30" fill="#82cfa0"/><circle cx="40" cy="55" r="5" fill="#1e362d"/><circle cx="60" cy="55" r="5" fill="#1e362d"/>'; break;
    case 6: // Baby Dragon
      inner = '<path d="M 50 30 Q 70 30 70 50 Q 70 70 50 70 Q 30 70 30 50 Q 30 30 50 30 Z" fill="#ff7043"/><circle cx="40" cy="45" r="4" fill="#fff"/><circle cx="60" cy="45" r="4" fill="#fff"/><path d="M 45 60 L 55 60" stroke="#fff" stroke-width="2"/>'; break;
    case 7: // Teen Dragon
      inner = '<path d="M 40 20 L 45 35 L 55 35 L 60 20 Z" fill="#e64a19"/><path d="M 50 30 Q 75 30 75 55 Q 75 80 50 80 Q 25 80 25 55 Q 25 30 50 30 Z" fill="#ff7043"/><circle cx="40" cy="45" r="5" fill="#fff"/><circle cx="60" cy="45" r="5" fill="#fff"/><path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#fff" stroke-width="3"/>'; break;
    case 8: // Adult Dragon
      inner = '<path d="M 20 60 Q 5 20 30 40 Z" fill="#bf360c"/><path d="M 80 60 Q 95 20 70 40 Z" fill="#bf360c"/><path d="M 50 20 Q 80 20 80 60 Q 80 90 50 90 Q 20 90 20 60 Q 20 20 50 20 Z" fill="#ff7043"/><circle cx="40" cy="45" r="6" fill="#fff"/><circle cx="60" cy="45" r="6" fill="#fff"/><path d="M 40 65 Q 50 75 60 65" fill="none" stroke="#fff" stroke-width="4"/>'; break;
    case 9: // Armored Dragon
      inner = '<path d="M 20 60 Q 5 20 30 40 Z" fill="#bf360c"/><path d="M 80 60 Q 95 20 70 40 Z" fill="#bf360c"/><path d="M 50 20 Q 80 20 80 60 Q 80 90 50 90 Q 20 90 20 60 Q 20 20 50 20 Z" fill="#ff7043"/><path d="M 30 30 L 70 30 L 60 40 L 40 40 Z" fill="#ffd54f"/><circle cx="40" cy="50" r="6" fill="#fff"/><circle cx="60" cy="50" r="6" fill="#fff"/><path d="M 40 70 L 60 70" stroke="#fff" stroke-width="4"/>'; break;
    case 10: // Cosmic Dragon
      inner = '<path d="M 10 50 Q 50 0 90 50 Q 50 100 10 50 Z" fill="#311b92"/><path d="M 50 20 Q 80 20 80 60 Q 80 90 50 90 Q 20 90 20 60 Q 20 20 50 20 Z" fill="#5e35b1"/><circle cx="35" cy="50" r="5" fill="#fff"/><circle cx="65" cy="50" r="5" fill="#fff"/><circle cx="50" cy="35" r="2" fill="#fff"/><circle cx="30" cy="70" r="1.5" fill="#fff"/><circle cx="70" cy="75" r="3" fill="#fff"/><path d="M 45 70 Q 50 75 55 70" fill="none" stroke="#fff" stroke-width="3"/>'; break;
  }
  return `<svg viewBox="0 0 100 100" style="width:100%; height:100%;" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
```

- [ ] **Step 2: Update existing Avatar calls**
In `src/main.js`, update `renderScoreboard` to use `getPetSvg` instead of `getAvatarSvg` for you and your friends.
```javascript
// replace getAvatarSvg(...) with getPetSvg(state.pet ? state.pet.level : 1) for 'you'
// For friends, just mock levels:
avatarSarah.innerHTML = getPetSvg(4);
avatarMark.innerHTML = getPetSvg(8);
```

- [ ] **Step 3: Commit**
```bash
git add src/main.js
git commit -m "feat: implement 10 SVG pet evolutions"
```

---

### Task 3: Dashboard Pet UI

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`

- [ ] **Step 1: Add HTML markup to Dashboard**
Add the Pet Card right under `.dash-top-section` in `index.html`.
```html
      <div class="dash-pet-section" style="margin: 12px 0;">
        <div class="glass-card" style="padding: 16px; border-radius: 20px; text-align: center; position: relative;">
          <div id="pet-svg-container" style="width: 100px; height: 100px; margin: 0 auto;"></div>
          <h3 style="margin: 8px 0 2px 0; font-family: 'Outfit'; color: var(--text);">Jouw Pet <span id="pet-level-badge" style="background: #ffca28; color: #fff; padding: 2px 6px; border-radius: 10px; font-size: 10px;">Lv.1</span></h3>
          
          <div style="text-align: left; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #d32f2f; margin-bottom: 2px;">
              <span>❤️ Health</span><span id="pet-health-text">100/100</span>
            </div>
            <div style="height: 6px; background: #eee; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
              <div id="pet-health-bar" style="height: 100%; width: 100%; background: #d32f2f; transition: width 0.3s;"></div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #4caf50; margin-bottom: 2px;">
              <span>✨ XP</span><span id="pet-xp-text">0/100</span>
            </div>
            <div style="height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
              <div id="pet-xp-bar" style="height: 100%; width: 0%; background: #4caf50; transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Update `renderDashboard` in `main.js`**
Update the new UI elements with real state:
```javascript
  const state = getState();
  const pet = state.pet || { level: 1, xp: 0, health: 100 };
  
  const petContainer = document.getElementById('pet-svg-container');
  if (petContainer) {
    petContainer.innerHTML = getPetSvg(pet.level);
    document.getElementById('pet-level-badge').textContent = `Lv.${pet.level}`;
    document.getElementById('pet-health-text').textContent = `${pet.health}/100`;
    document.getElementById('pet-health-bar').style.width = `${pet.health}%`;
    document.getElementById('pet-xp-text').textContent = `${pet.xp}/100`;
    document.getElementById('pet-xp-bar').style.width = `${pet.xp}%`;
  }
```

- [ ] **Step 3: Commit**
```bash
git add index.html src/main.js
git commit -m "feat: add dashboard pet UI"
```

---

### Task 4: Integrate Logic with Actions

**Files:**
- Modify: `src/store.js`
- Modify: `src/main.js`

- [ ] **Step 1: Reward XP on Habit Completion**
In `src/store.js`, update `completeHabit`:
```javascript
export function completeHabit(habitId, reflectionText = "") {
  const state = getState();
  const today = getTodayString();
  const habit = state.habits.find(h => h.id === habitId);
  if (habit) {
    if (!habit.completedDates) habit.completedDates = [];
    if (!habit.completedDates.includes(today)) {
      habit.completedDates.push(today);
      habit.completions += 1;
      state.score += 10;
      saveState(state); // Save before addPetXP to avoid losing habit data if addPetXP overwrites
      addPetXP(10);
    }
  }
}
```

- [ ] **Step 2: Evaluate Daily Pet Health on App Load**
In `src/store.js`, add `evaluateDailyPetGoals()`:
```javascript
export function evaluateDailyPetGoals() {
  const state = getState();
  if (!state.pet) return;
  const today = getTodayString();
  if (state.pet.lastUpdate !== today) {
    // Punish/Reward based on missing history or bad choices yesterday.
    // For simplicity, just reduce 5 health every day they login but didn't update, 
    // or if they missed goals. We will just subtract 5 health passively per new day to simulate hunger.
    state.pet.health = Math.max(0, state.pet.health - 5);
    state.pet.lastUpdate = today;
    saveState(state);
  }
}
```

- [ ] **Step 3: Call Daily Eval**
In `src/main.js`, after `initStore()`:
```javascript
import { evaluateDailyPetGoals } from './store.js';
// ...
initStore();
evaluateDailyPetGoals();
```

- [ ] **Step 4: Commit**
```bash
git add src/store.js src/main.js
git commit -m "feat: link pet logic to habits and daily hunger"
```
