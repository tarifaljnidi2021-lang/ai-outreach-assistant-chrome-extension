// utils.js - Utility functions for the popup

export function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
}