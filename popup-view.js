export function showAuthSection() {
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    authSection.classList.remove('hidden');
  }
  document.querySelectorAll('.main-section').forEach((el) => el.classList.add('hidden'));
}

export function showMainSection() {
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    authSection.classList.add('hidden');
  }
  document.querySelectorAll('.main-section').forEach((el) => el.classList.remove('hidden'));
}
