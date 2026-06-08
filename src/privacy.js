export function exportData() {
  return localStorage.getItem('health_app_state') || '{}';
}

export function importData(jsonString) {
  try {
    JSON.parse(jsonString); // validate
    localStorage.setItem('health_app_state', jsonString);
    return true;
  } catch (e) {
    return false;
  }
}
