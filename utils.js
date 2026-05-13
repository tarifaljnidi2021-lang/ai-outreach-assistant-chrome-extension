// utils.js - Utility functions for the popup

export function showStatus(message, type, progress = null) {
  const status = document.getElementById('status');
  status.innerHTML = message;
  status.className = type;

  // Remove existing progress bar
  const existingProgress = status.querySelector('.progress-bar');
  if (existingProgress) {
    existingProgress.remove();
  }

  if (progress !== null && type === 'loading') {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${progress}%`;

    const progressText = document.createElement('span');
    progressText.className = 'progress-text';
    progressText.textContent = `${progress}%`;
    progressText.style.color = progress >= 50 ? '#fff' : '#000';
    progressText.style.textShadow = progress >= 50 ? '0 1px 2px rgba(0, 0, 0, 0.35)' : 'none';

    progressBar.appendChild(progressFill);
    progressBar.appendChild(progressText);
    status.appendChild(progressBar);
  }
}