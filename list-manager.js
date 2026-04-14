import { createListModalController } from './list-modal.js';

export const initListManager = () => {
  const listSelect = document.getElementById('list-select');
  const createListButton = document.getElementById('create-list');
  const createListModal = document.getElementById('create-list-modal');
  const listNameInput = document.getElementById('list-name-input');
  const modalCancelButton = document.getElementById('modal-cancel');
  const modalCreateButton = document.getElementById('modal-create');

  if (!listSelect || !createListButton || !createListModal || !listNameInput || !modalCancelButton || !modalCreateButton) {
    return;
  }

  const addListOption = (listName) => {
    const option = document.createElement('option');
    option.value = listName;
    option.textContent = listName;
    listSelect.appendChild(option);
    listSelect.value = listName;
  };

  const modalController = createListModalController({
    modalElement: createListModal,
    inputElement: listNameInput,
    cancelButton: modalCancelButton,
    createButton: modalCreateButton,
    onCreate: addListOption
  });

  createListButton.addEventListener('click', modalController.open);
};
