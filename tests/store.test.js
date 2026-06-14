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

test('completeHabit stores reflection text', () => {
  initStore();
  addHabit({ trigger: 'Morning', action: 'Read 10 pages', difficulty: 'Normal', slot: 'Morning' });
  const state = getState();
  const habitId = state.habits.find(h => h.action === 'Read 10 pages').id;
  
  completeHabit(habitId, "I read a very good chapter today about habits.");
  
  const updatedState = getState();
  const updatedHabit = updatedState.habits.find(h => h.id === habitId);
  
  // store.js doesn't export getTodayString, so we just check if reflections exists
  // and has the value for some key
  expect(updatedHabit.reflections).toBeDefined();
  const reflectionValues = Object.values(updatedHabit.reflections);
  expect(reflectionValues).toContain("I read a very good chapter today about habits.");
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
