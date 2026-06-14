# Showcase Dummy Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the application with rich, dynamic showcase dummy data on first-time startup and via `resetProgress()`, and add a new `cleanData()` function to clear all data and start fresh.

**Architecture:** 
- Add dynamic date-relative dummy data creation in `src/store.js`.
- Make `initStore()` use the dummy state by default.
- Export `resetProgress()` and `cleanData()` from `src/store.js`.
- Integrate both functions globally on `window` in `src/main.js`.
- Update and add Vitest test cases in `tests/store.test.js` to ensure the new behavior works correctly.

**Tech Stack:** JavaScript, Vitest, LocalStorage

---

### Task 1: Add getDummyState and helpers in store.js

**Files:**
- Modify: `src/store.js`

- [ ] **Step 1: Write getDummyState and modify initStore, resetProgress, and cleanData in src/store.js**
  We will add the `getDummyState` helper and modify `initStore` to use it. We will also export `resetProgress` and `cleanData` from `src/store.js`.
  
  Code to add/modify:
  ```javascript
  export function getDummyState() {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    const [today, yesterday, day2, day3, day4] = dates;

    return {
      history: [
        {
          date: day4,
          steps: 8432,
          foods: [
            { name: 'Oatmeal with Banana', calories: 350, carbs: 60, protein: 10, fat: 5, fiber: 8, sodium: 50, healthScore: 'A', timestamp: Date.now() - 4 * 24 * 3600 * 1000, count: 1 },
            { name: 'Grilled Chicken Salad', calories: 480, carbs: 15, protein: 35, fat: 18, fiber: 5, sodium: 620, healthScore: 'A', timestamp: Date.now() - 4 * 24 * 3600 * 1000 + 4 * 3600 * 1000, count: 1 },
            { name: 'Greek Yogurt', calories: 150, carbs: 10, protein: 15, fat: 3, fiber: 0, sodium: 60, healthScore: 'B', timestamp: Date.now() - 4 * 24 * 3600 * 1000 + 8 * 3600 * 1000, count: 1 }
          ]
        },
        {
          date: day3,
          steps: 10543,
          foods: [
            { name: 'Whole Wheat Toast with Avocado', calories: 280, carbs: 24, protein: 8, fat: 14, fiber: 7, sodium: 320, healthScore: 'A', timestamp: Date.now() - 3 * 24 * 3600 * 1000, count: 1 },
            { name: 'Apple', calories: 95, carbs: 25, protein: 0, fat: 0, fiber: 4, sodium: 2, healthScore: 'A', timestamp: Date.now() - 3 * 24 * 3600 * 1000 + 3 * 3600 * 1000, count: 1 },
            { name: 'Salmon with Broccoli', calories: 550, carbs: 12, protein: 42, fat: 28, fiber: 6, sodium: 450, healthScore: 'A', timestamp: Date.now() - 3 * 24 * 3600 * 1000 + 8 * 3600 * 1000, count: 1 }
          ]
        },
        {
          date: day2,
          steps: 7210,
          foods: [
            { name: 'Oatmeal with Banana', calories: 350, carbs: 60, protein: 10, fat: 5, fiber: 8, sodium: 50, healthScore: 'A', timestamp: Date.now() - 2 * 24 * 3600 * 1000, count: 1 },
            { name: 'Mixed Berries', calories: 80, carbs: 18, protein: 1, fat: 0, fiber: 5, sodium: 1, healthScore: 'A', timestamp: Date.now() - 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000, count: 1 },
            { name: 'Pasta Carbonara', calories: 720, carbs: 80, protein: 22, fat: 34, fiber: 3, sodium: 980, healthScore: 'C', timestamp: Date.now() - 2 * 24 * 3600 * 1000 + 8 * 3600 * 1000, count: 1 }
          ]
        },
        {
          date: yesterday,
          steps: 12430,
          foods: [
            { name: 'Greek Yogurt', calories: 150, carbs: 10, protein: 15, fat: 3, fiber: 0, sodium: 60, healthScore: 'B', timestamp: Date.now() - 24 * 3600 * 1000, count: 1 },
            { name: 'Grilled Chicken Salad', calories: 480, carbs: 15, protein: 35, fat: 18, fiber: 5, sodium: 620, healthScore: 'A', timestamp: Date.now() - 24 * 3600 * 1000 + 4 * 3600 * 1000, count: 1 },
            { name: 'Dark Chocolate', calories: 170, carbs: 15, protein: 2, fat: 12, fiber: 2, sodium: 10, healthScore: 'C', timestamp: Date.now() - 24 * 3600 * 1000 + 8 * 3600 * 1000, count: 1 }
          ]
        },
        {
          date: today,
          steps: 4210,
          foods: [
            { name: 'Whole Wheat Toast with Avocado', calories: 280, carbs: 24, protein: 8, fat: 14, fiber: 7, sodium: 320, healthScore: 'A', timestamp: Date.now(), count: 1 }
          ]
        }
      ],
      habits: [
        {
          id: 1001,
          trigger: 'When I wake up',
          action: 'Drink 500ml water',
          time: '08:00',
          frequency: 'Daily',
          difficulty: 'Easy',
          slot: 'Morning',
          completions: 5,
          completedDates: [today, yesterday, day2, day3, day4],
          createdDate: day4,
          reflections: {
            [today]: 'Felt very refreshing first thing in the morning.',
            [yesterday]: 'A bit hard to finish the whole glass, but did it.',
            [day2]: 'Felt energized.',
            [day3]: 'Good routine starting to form.',
            [day4]: 'Easy start.'
          }
        },
        {
          id: 1002,
          trigger: 'After lunch',
          action: 'Go for a 15-minute walk',
          time: '13:00',
          frequency: 'Daily',
          difficulty: 'Normal',
          slot: 'Afternoon',
          completions: 2,
          completedDates: [yesterday, day3],
          createdDate: day4,
          reflections: {
            [yesterday]: 'Nice sunny weather outside.',
            [day3]: 'Good break from studying.'
          }
        },
        {
          id: 1003,
          trigger: 'Before going to bed',
          action: 'Write down 3 things I\'m grateful for',
          time: '22:00',
          frequency: 'Daily',
          difficulty: 'Normal',
          slot: 'Evening',
          completions: 3,
          completedDates: [yesterday, day2, day4],
          createdDate: day4,
          reflections: {
            [yesterday]: 'Grateful for good food, a nice walk, and sleep.',
            [day2]: 'Grateful for code working on the first try.',
            [day4]: 'Grateful for completing my goals.'
          }
        }
      ],
      score: 120,
      avatar: { hat: 'cap', item: 'none' },
      unlockedHats: ['none', 'cap', 'glasses'],
      isInventoryMode: false,
      goals: {
        calories: 2000,
        protein: 130,
        fat: 60,
        carbs: 220,
        fiber: 30,
        sodium: 2300
      }
    };
  }

  export function cleanData() {
    const cleanState = { 
      history: [], 
      habits: [], 
      score: 0,
      avatar: { hat: 'none', item: 'none' },
      unlockedHats: ['none'],
      isInventoryMode: true,
      goals: null
    };
    saveState(cleanState);
  }

  export function resetProgress() {
    const dummyState = getDummyState();
    saveState(dummyState);
  }
  ```

  And change the initialization block in `initStore()` (lines 1-11):
  ```javascript
  export function initStore() {
    if (!localStorage.getItem('health_app_state')) {
      const defaultState = getDummyState();
      localStorage.setItem('health_app_state', JSON.stringify(defaultState));
    } else {
  ```

- [ ] **Step 2: Commit store changes**
  Run: `git commit -am "feat: implement getDummyState, cleanData, resetProgress in store.js"`

---

### Task 2: Expose cleanData and update resetProgress in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Update window-level bindings in main.js**
  We will import `cleanData` and `resetProgress` from `./store.js`, bind them to `window.cleanData` and `window.resetProgress`, and update the dev tools console messages.
  
  Import at the top of `src/main.js` (around line 4):
  ```javascript
  import { addFood, getTodayTotals, getTodayRecord, addHabit, completeHabit, getState, initStore, updateProfile, buyHat, finishInventory, checkNeverMissTwice, getHabitStreak, getTodayString, cleanData, resetProgress } from './store.js';
  ```
  
  Update window bindings (around line 839):
  ```javascript
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
  
  console.log("🛠️ Dev Tools: Type 'resetProgress()' to reload showcase data, or 'cleanData()' to start completely clean.");
  ```

- [ ] **Step 2: Commit main.js changes**
  Run: `git commit -am "feat: expose cleanData and update resetProgress in main.js"`

---

### Task 3: Update and Add Tests in store.test.js

**Files:**
- Modify: `tests/store.test.js`

- [ ] **Step 1: Update existing store.test.js to reflect the new default state and add cleanData test**
  Update imports and tests in `tests/store.test.js`:
  ```javascript
  import { expect, test, beforeEach } from 'vitest';
  import { initStore, getState, addHabit, completeHabit, cleanData } from '../src/store.js';
  
  beforeEach(() => {
    localStorage.clear();
  });
  
  test('Store initializes with showcase dummy state', () => {
    initStore();
    const state = getState();
    // history should contain the 5 days of dummy food/step logs
    expect(state.history.length).toBe(5);
    // score should be 120 points
    expect(state.score).toBe(120);
    // avatar hat should be 'cap'
    expect(state.avatar.hat).toBe('cap');
    // unlockedHats should have 'none', 'cap', 'glasses'
    expect(state.unlockedHats).toContain('cap');
    expect(state.unlockedHats).toContain('glasses');
  });
  
  test('cleanData clears all data to empty slate', () => {
    initStore();
    cleanData();
    const state = getState();
    expect(state.history).toEqual([]);
    expect(state.habits).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.avatar.hat).toBe('none');
    expect(state.isInventoryMode).toBe(true);
    expect(state.goals).toBeNull();
  });
  ```

- [ ] **Step 2: Run vitest to ensure all tests pass**
  Run: `npx vitest run`
  Expected: All 6 tests pass successfully.

- [ ] **Step 3: Commit test changes**
  Run: `git commit -am "test: update store initialization tests and add cleanData test"`
