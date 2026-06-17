export const getUserAgent = () => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    throw new Error('Navigator userAgent is not available in this context.');
  }

  return navigator.userAgent;
};
