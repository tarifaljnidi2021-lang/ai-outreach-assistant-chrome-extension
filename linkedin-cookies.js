const ensureCookieApiAvailable = () => {
  if (!chrome?.cookies?.getAll) {
    throw new Error('Chrome cookies permission is missing.');
  }
};

const LINKEDIN_COOKIE_ALLOWLIST = new Set([
  'li_at',
  'JSESSIONID',
  'li_rm',
  'bcookie',
  'bscookie',
  'lidc'
]);

export const getLinkedInCookies = async () => {
  ensureCookieApiAvailable();

  const allCookies = await chrome.cookies.getAll({ domain: 'linkedin.com' });

  return allCookies
    .filter(cookie => typeof cookie?.name === 'string' && typeof cookie?.value === 'string')
    .filter(cookie => typeof cookie?.domain === 'string' && cookie.domain.toLowerCase().includes('linkedin.com'))
    .filter(cookie => LINKEDIN_COOKIE_ALLOWLIST.has(cookie.name))
    .map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      expires: typeof cookie.expirationDate === 'number' ? cookie.expirationDate : undefined,
      httpOnly: Boolean(cookie.httpOnly),
      secure: Boolean(cookie.secure)
    }));
};
