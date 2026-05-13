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
    progressBar.innerHTML = `
      <div class="progress-fill" style="width: ${progress}%"></div>
      <span class="progress-text">${progress}%</span>
    `;
    status.appendChild(progressBar);
  }
}