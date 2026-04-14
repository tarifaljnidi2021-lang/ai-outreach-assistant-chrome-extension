// parsing.js - Profile parsing functions

export const extractProfilesCode = `const extractProfiles = () => {
  const results = [];
  const seen = new Set();

  const anchors = Array.from(
     document.querySelectorAll('a[href*="/in/"]:not([href*="miniProfile"])')
  );

  anchors.forEach(linkEl => {
    const profileUrl = (linkEl.href || '').split('?')[0];

    if (!profileUrl || !/\/in\//i.test(profileUrl)) return;
    if (seen.has(profileUrl)) return;

    let name =
      (linkEl.innerText || linkEl.textContent || '')
        .replace(/\u00A0/g, ' ')
        .trim()
        .split('\n')[0]
        .trim();

    if (!name || name.length < 2) return;

    seen.add(profileUrl);

    results.push({
      name,
      profile_url: profileUrl
    });
  });

  return results;
};`;