export function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = ''; // Fallback to CSS class display
    target.style.animation = 'none';
    target.offsetHeight; // trigger reflow
    target.style.animation = 'fadeIn 0.2s ease-out';
  }
}
