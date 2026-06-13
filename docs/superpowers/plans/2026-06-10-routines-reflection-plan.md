# Routines & Reflection Friction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the Habit Tracker into a dedicated "Routines" page and introduce mandatory written reflections for completing habits to reduce cheating.

**Architecture:** 
1. `store.js`: Extend `completeHabit` to store reflection strings keyed by date.
2. `index.html`: Create a new `view-routines` page, move habit creation/listing UI there, and add a reflection modal. Update the bottom nav.
3. `main.js`: Handle modal opening/validation, and update the calendar summary to display historical reflections.

**Tech Stack:** Vanilla JS, HTML, CSS. Vitest for testing.

---

### Task 1: Extend State Logic for Reflections

**Files:**
- Modify: `src/store.js`
- Modify: `tests/store.test.js`

- [ ] **Step 1: Write the failing test**

Modify `tests/store.test.js` to add a test for `completeHabit` storing reflections:

```javascript
import { addHabit, completeHabit, getTodayString } from '../src/store.js';

test('completeHabit stores reflection text', () => {
  initStore();
  addHabit({ trigger: 'Morning', action: 'Read 10 pages', difficulty: 'Normal', slot: 'Morning' });
  const state = getState();
  const habitId = state.habits[0].id;
  
  completeHabit(habitId, "I read a very good chapter today about habits.");
  
  const updatedState = getState();
  const updatedHabit = updatedState.habits.find(h => h.id === habitId);
  const today = getTodayString();
  
  expect(updatedHabit.reflections).toBeDefined();
  expect(updatedHabit.reflections[today]).toBe("I read a very good chapter today about habits.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/store.test.js`
Expected: FAIL because `reflections` is not defined or doesn't store the text.

- [ ] **Step 3: Write minimal implementation**

Modify `completeHabit` in `src/store.js`:
Change the signature to accept `reflectionText` and store it:

```javascript
export function completeHabit(habitId, reflectionText = "") {
  const state = getState();
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;
  
  const today = getTodayString();
  if (habit.completedDates && habit.completedDates.includes(today)) return;
  
  if (!habit.completedDates) habit.completedDates = [];
  habit.completedDates.push(today);
  
  if (!habit.reflections) habit.reflections = {};
  habit.reflections[today] = reflectionText;
  
  // existing score logic...
  let points = 5;
  if (habit.difficulty === 'Easy') points = 2;
  else if (habit.difficulty === 'Hard') points = 10;
  
  state.score = (state.score || 0) + points;
  saveState(state);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/store.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/store.js tests/store.test.js
git commit -m "feat: support saving reflections in completeHabit"
```

---

### Task 2: UI Structure for Routines Page & Modal

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Create view-routines and move UI elements**

In `index.html`, right before `<div id="view-habits" ...>`, add the new routines view. Move the "Daily Routines" header, "Add Habit" button, streak display, and `#habits-list` into this new view.

```html
    <div id="view-routines" class="view" style="display: none; padding: 24px 20px; position: relative;">
      <h2 style="margin-top: 0; font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; background: -webkit-linear-gradient(45deg, var(--primary-dark), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">My Routines</h2>
      
      <div style="position: absolute; right: 20px; top: 24px;">
        <button onclick="document.getElementById('habit-form-modal').style.display='flex'" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(130, 207, 160, 0.4); cursor: pointer; transition: transform 0.2s;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div class="glass-card" id="never-miss-twice-banner" style="display: none; background: rgba(255, 100, 100, 0.1); border: 1px solid rgba(255, 100, 100, 0.3); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
        <strong style="color: #d32f2f; display: block; margin-bottom: 4px;">⚠️ Never Miss Twice!</strong>
        <span style="font-size: 13px; color: #b71c1c;">You missed some routines yesterday. Use the 2-minute rule today to bounce back!</span>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px; color: var(--text-light);">Current Streak: <span id="current-streak-display" style="color: var(--primary); font-size: 16px;">0</span> days 🔥</span>
      </div>

      <ul id="habits-list" style="list-style: none; padding: 0; margin: 0;">
        <!-- Filled by JS -->
      </ul>
    </div>
```

*(Ensure you delete these elements from their old location inside `view-habits`, leaving only the calendar and daily summary there).*

- [ ] **Step 2: Add Reflection Modal**

At the bottom of `index.html` (near other modals), add the `#habit-reflection-modal`:

```html
  <div id="habit-reflection-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
    <div class="glass-card" style="width: 90%; max-width: 400px; padding: 24px; position: relative; background: white; margin: auto; border-radius: 20px;">
      <h3 style="margin-top: 0; font-family: 'Outfit', sans-serif; color: var(--primary-dark);">Reflection Required</h3>
      <p style="font-size: 14px; color: var(--text-light); margin-bottom: 16px;">How did it go? Describe what you did or how it felt (min 10 words).</p>
      
      <textarea id="reflection-input" placeholder="I ran for 20 minutes outside and it felt great..." style="width: 100%; height: 100px; padding: 12px; border-radius: 12px; border: 1px solid var(--card-border); font-family: 'Inter', sans-serif; resize: none; margin-bottom: 8px;"></textarea>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span id="reflection-word-count" style="font-size: 12px; color: #888; font-weight: 600;">0 / 10 words</span>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="document.getElementById('habit-reflection-modal').style.display='none'" class="action-btn" style="flex: 1; background: #eee; color: #333; margin: 0;">Cancel</button>
        <button id="submit-reflection-btn" class="action-btn" disabled style="flex: 1; margin: 0; opacity: 0.5; cursor: not-allowed;">Claim Reward</button>
      </div>
    </div>
  </div>
```

- [ ] **Step 3: Update Bottom Nav**

Modify `.bottom-nav` in `index.html` to add the Routines button and reposition elements to maintain balance (5 buttons total). Replace the current `view-habits` button with `view-routines`, and add a dedicated calendar icon button for `view-habits`.

```html
  <nav class="bottom-nav">
    <button onclick="navigateTo('view-routines')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="nav-indicator"></span>
    </button>
    <button onclick="navigateTo('view-habits')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      <span class="nav-indicator"></span>
    </button>
    <button class="nav-home-btn active" onclick="navigateTo('view-dashboard')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </button>
    <button onclick="navigateTo('view-environment')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="9" y1="14" x2="15" y2="14"></line><line x1="9" y1="10" x2="15" y2="10"></line></svg>
      <span class="nav-indicator"></span>
    </button>
    <button onclick="navigateTo('view-profile')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span class="nav-indicator"></span>
    </button>
  </nav>
```
*(Remove the `<div class="nav-spacer"></div>` since we now have exactly 5 evenly sized buttons, which centers the dashboard button naturally).*

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: layout changes for routines page and reflection modal"
```

---

### Task 3: Implementation Logic in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Modal Logic**

In `main.js`, add the modal word count validation and submission logic inside the `DOMContentLoaded` event block:

```javascript
  let currentReflectionHabitId = null;

  window.openReflectionModal = function(id) {
    currentReflectionHabitId = id;
    document.getElementById('reflection-input').value = '';
    document.getElementById('reflection-word-count').textContent = '0 / 10 words';
    document.getElementById('submit-reflection-btn').disabled = true;
    document.getElementById('submit-reflection-btn').style.opacity = '0.5';
    document.getElementById('submit-reflection-btn').style.cursor = 'not-allowed';
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
```

- [ ] **Step 2: Update Habit Rendering**

Inside `renderHabits()` in `main.js`:
Change the `onclick` handler in the habit list rendering to open the modal instead of instantly completing it. Find the `<button>` that calls `completeHabitAction(h.id)` and change it:

```javascript
          <button 
            onclick="window.openReflectionModal('${h.id}')"
            style="background: ${isCompleted ? 'var(--primary)' : 'transparent'}; border: 2px solid var(--primary); color: ${isCompleted ? 'white' : 'var(--primary)'}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"
            ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? '✓' : ''}
          </button>
```

- [ ] **Step 3: Update Calendar Summary**

In `renderHabits()` inside `main.js`, update how completed habits are displayed in the right-side summary. Instead of just listing the action, include their reflection text.

Find this section:
```javascript
      habitsContainer.innerHTML = completedHabits.map(h => `
        <li style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.7); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02);">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</div>
          <strong style="font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text);">${h.action}</strong>
        </li>
      `).join('');
```

Replace it with:
```javascript
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
```

Also, remember to remove the old `window.completeHabitAction` definition since we replaced it with `window.openReflectionModal`.

- [ ] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "feat: implement reflection modal logic and update calendar summary"
```
