// extractor.js - LinkedIn profile extraction logic

export const extractFunc = async (maxCountArg = 100) => {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const autoScroll = async () => {
    for (let i = 0; i < 6; i++) {
      window.scrollBy(0, window.innerHeight);
      await delay(800);
    }
  };

  const extractProfiles = () => {
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
  };

  const getNextButton = () => {
    return document.querySelector(
      'button[data-testid="pagination-controls-next-button-visible"]'
    );
  };

  const allResults = [];
  const globalSeen = new Set();
  const maxCount = typeof maxCountArg === 'number' ? maxCountArg : 100;
  let page = 1;

  while (allResults.length < maxCount) {
    console.log(`📄 Page ${page}`);

    await autoScroll();
    await delay(1000);

    const profiles = extractProfiles();

    profiles.forEach(p => {
      if (!globalSeen.has(p.profile_url) && allResults.length < maxCount) {
        globalSeen.add(p.profile_url);
        allResults.push(p);
      }
    });

    if (allResults.length >= maxCount) break;

    const nextBtn = getNextButton();

    if (!nextBtn || nextBtn.disabled) {
      console.log('⛔ No more pages');
      break;
    }

    nextBtn.click();
    console.log('➡️ Clicking next...');

    await delay(1000);
    page += 1;
  }

  console.log('FINAL RESULTS:', allResults.length);
  return allResults;
};