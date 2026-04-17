export const createListModalController = ({
  modalElement,
  inputElement,
  errorElement,
  cancelButton,
  createButton,
  onCreate
}) => {
  const setError = (message = '') => {
    if (!errorElement) {
      return;
    }

    if (!message) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
      return;
    }

    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  };

  const open = () => {
    modalElement.classList.remove('hidden');
    inputElement.value = '';
    createButton.disabled = true;
    setError('');
    inputElement.focus();
  };

  const close = () => {
    modalElement.classList.add('hidden');
    setError('');
  };

  const submit = async () => {
    const listName = inputElement.value.trim();

    if (!listName) {
      return;
    }

    createButton.disabled = true;
    setError('');
    let keepDisabled = false;

    try {
      await onCreate(listName);
      close();
    } catch (error) {
      const message = (error?.message || '').toLowerCase();

      if (message.includes('already exists')) {
        setError('This list name already exists.');
        keepDisabled = true;
      } else {
        setError('Unable to create list. Please try again.');
      }
    } finally {
      if (!keepDisabled) {
        createButton.disabled = false;
      }
    }
  };

  cancelButton.addEventListener('click', close);
  createButton.addEventListener('click', submit);

  inputElement.addEventListener('input', () => {
    setError('');
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
