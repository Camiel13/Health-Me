# Showcase Dummy Data Spec

This spec outlines the changes required to pre-load the application with rich showcase dummy data on first startup, configure `resetProgress()` to reload this showcase data, and introduce a new `cleanData()` function to start with a blank database.

## 1. Goals & Requirements
- **Showcase First Impression**: When a user (e.g., the Big History teacher) opens the app for the first time, it should not be empty. It should display a pre-loaded history, streaks, points, and items to showcase the app's features immediately.
- **`resetProgress()`**: This existing developer/user function should reset the state back to the showcase dummy data.
- **`cleanData()`**: A new developer/user function to completely wipe all progress and settings, returning the app to a clean, empty state with onboarding active.

## 2. Showcase Dummy Data Structure
The dummy state will contain:
- **Profile & Score**:
  - `score`: `120` points.
  - `avatar`: `{ hat: 'cap', item: 'none' }`.
  - `unlockedHats`: `['none', 'cap', 'glasses']`.
  - `isInventoryMode`: `false` (onboarding complete).
  - `goals`: `{ calories: 2000, protein: 130, fat: 60, carbs: 220, fiber: 30, sodium: 2300 }`.
- **Habits**:
  1. *Drink water in the morning*: Completed on all of the last 5 days (5-day streak).
  2. *Afternoon walk*: Completed yesterday and 3 days ago.
  3. *Evening reflection*: Completed yesterday, 2 days ago, and 4 days ago.
- **History (Food & Steps)**:
  - 4 days ago: Oatmeal (A), Grilled Chicken Salad (A), Greek Yogurt (B). Steps: 8432.
  - 3 days ago: Whole Wheat Toast with Avocado (A), Apple (A), Salmon (A). Steps: 10543.
  - 2 days ago: Oatmeal (A), Mixed Berries (A), Pasta Carbonara (C). Steps: 7210.
  - Yesterday: Greek Yogurt (B), Grilled Chicken Salad (A), Dark Chocolate (C). Steps: 12430.
  - Today: Avocado Toast (A). Steps: 4210.

## 3. Implementation Plan
### Step 1: Update `src/store.js`
- Define `getDummyState()` to dynamically generate the state object using relative dates (today, yesterday, etc.) to ensure the streak remains active regardless of when the app is run.
- Update `initStore()` to set the showcase dummy state as the default when `localStorage.getItem('health_app_state')` is empty.
- Add and export `resetProgress()` to restore the dummy state.
- Add and export `cleanData()` to write a clean state (empty history/habits, `isInventoryMode: true`).

### Step 2: Update `src/main.js`
- Expose `cleanData` globally on the `window` object:
  ```javascript
  window.cleanData = function() { ... }
  ```
- Update `window.resetProgress` to call the store's `resetProgress()` helper rather than removing the localStorage item.
- Update console instructions.

### Step 3: Update `tests/store.test.js`
- Update the initialization test to verify that the store initializes with the showcase dummy data (e.g., history length is greater than 0, habits length is greater than 0, score is 120, etc.).
- Add a new test to verify `cleanData()` returns the store to a truly clean slate (empty history/habits, `isInventoryMode: true`, etc.).
