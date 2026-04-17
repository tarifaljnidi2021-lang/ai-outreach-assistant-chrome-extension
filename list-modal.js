export const createListModalController = ({
  modalElement,
  inputElement,
  cancelButton,
  createButton,
  onCreate
}) => {
  const open = () => {
    modalElement.classList.remove('hidden');
    inputElement.value = '';
    createButton.disabled = true;
    inputElement.focus();
  };

  const close = () => {
    modalElement.classList.add('hidden');
  };

  const submit = async () => {
    const listName = inputElement.value.trim();

    if (!listName) {
      return;
    }

    createButton.disabled = true;
    try {
      await onCreate(listName);
      close();
    } finally {
      createButton.disabled = false;
    }
  };

  cancelButton.addEventListener('click', close);
  createButton.addEventListener('click', submit);

  inputElement.addEventListener('input', () => {
    createButton.disabled = !inputElement.value.trim();
  });

  inputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !createButton.disabled) {
      submit();
    }
  });

  modalElement.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalElement.classList.contains('hidden')) {
      close();
    }
  });

  return { open, close };
};
