export function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
    target.style.animation = 'fadeIn 0.2s ease-out';
  }
}
