export function initStore() {
  if (!localStorage.getItem('health_app_state')) {
    const defaultState = { calories: 0, steps: 0, history: [] };
    localStorage.setItem('health_app_state', JSON.stringify(defaultState));
  }
}

export function getState() {
  return JSON.parse(localStorage.getItem('health_app_state'));
}
