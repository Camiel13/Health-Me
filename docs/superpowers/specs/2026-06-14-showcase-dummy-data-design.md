# Showcase Dummy Data Spec

This spec outlines the changes required to pre-load the application with a clean state on first startup, configure `resetProgress()` to reload the rich showcase dummy data, introduce a new `cleanData()` function to start with a blank database, and add a keybind (`Ctrl + Shift + D`) to trigger the showcase data loading at any time.

## 1. Goals & Requirements
- **First Startup**: When the user opens the app for the first time, it should start in a clean state with the onboarding/inventory active so they can demonstrate the setup.
- **Keybind (`Ctrl + Shift + D`)**: Pressing `Ctrl + Shift + D` at any time will trigger a confirmation dialog to populate the app with the rich showcase dummy data.
- **`resetProgress()`**: This developer/user function should reset the state back to the showcase dummy data.
- **`cleanData()`**: A developer/user function to completely wipe all progress and settings, returning the app to a clean, empty state with onboarding active.

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
- Define `getDummyState()` to dynamically generate the state object using relative dates (today, yesterday, etc.) to ensure the streak remains active.
- Update `initStore()` to initialize with a clean/empty default state when `localStorage.getItem('health_app_state')` is empty.
- Add and export `resetProgress()` to restore the dummy state.
- Add and export `cleanData()` to write a clean state (empty history/habits, `isInventoryMode: true`).

### Step 2: Update `src/main.js`
- Expose `cleanData` globally on the `window` object:
  ```javascript
  window.cleanData = function() { ... }
  ```
- Update `window.resetProgress` to call the store's `resetProgress()` helper.
- Add window event listener for `Ctrl + Shift + D` keybind to call `resetProgress()` with a confirmation prompt.
- Update console instructions to document both options and the keybind.

### Step 3: Update `tests/store.test.js`
- Update the initialization test to verify that the store initializes with a clean default state (empty history/habits, onboarding active).
- Add a new test to verify `resetProgress()` successfully loads the showcase dummy state.
- Add a new test to verify `cleanData()` returns the store to a truly clean slate (empty history/habits, `isInventoryMode: true`, etc.).
