import { getListProspects } from './api.js';

export async function loadLists() {
  const select = document.getElementById('list-select');
  if (!select) {
    return;
  }

  try {
    const lists = await getListProspects();
    select.innerHTML = '<option value="" selected>Select a list</option>';
    lists.forEach((list) => {
      const option = document.createElement('option');
      option.value = String(list.id);
      option.textContent = list.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load prospects lists:', error);
  }
}
