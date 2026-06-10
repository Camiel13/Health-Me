import { expect, test, beforeEach } from 'vitest';
import { initStore, getState, addHabit, completeHabit } from '../src/store.js';

beforeEach(() => {
  localStorage.clear();
});

test('Store initializes with default state', () => {
  initStore();
  const state = getState();
  expect(state.history).toEqual([]);
});

test('completeHabit stores reflection text', () => {
  initStore();
  addHabit({ trigger: 'Morning', action: 'Read 10 pages', difficulty: 'Normal', slot: 'Morning' });
  const state = getState();
  const habitId = state.habits[0].id;
  
  completeHabit(habitId, "I read a very good chapter today about habits.");
  
  const updatedState = getState();
  const updatedHabit = updatedState.habits.find(h => h.id === habitId);
  
  // store.js doesn't export getTodayString, so we just check if reflections exists
  // and has the value for some key
  expect(updatedHabit.reflections).toBeDefined();
  const reflectionValues = Object.values(updatedHabit.reflections);
  expect(reflectionValues).toContain("I read a very good chapter today about habits.");
});
