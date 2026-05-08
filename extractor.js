// extractor.js

export const extractFunc = async (maxCountArg = 100) => {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const maxCount =
    typeof maxCountArg === 'number'
      ? maxCountArg
      : parseInt(maxCountArg, 10) || 100;

  console.log('🚀 extractor started');
  console.log('maxCount:', maxCount);

  const autoScroll = async () => {
    let lastHeight = 0;

    for (let i = 0; i < 10; i++) {
      window.scrollTo(0, document.body.scrollHeight);

      await delay(1200);

      const newHeight = document.body.scrollHeight;

      if (newHeight === lastHeight) {
        break;
      }

      lastHeight = newHeight;
    }
  };

  const extractProfiles = () => {
    const results = [];
    const seen = new Set();

    // ALL linkedin profile links currently visible
    const profileLinks = Array.from(
      document.querySelectorAll('a[href*="/in/"]')
    );

    console.log('found links:', profileLinks.length);

    profileLinks.forEach(link => {
      try {
        if (!link.offsetParent) return;

        const profileUrl = (link.href || '').split('?')[0];

        if (!profileUrl.includes('/in/')) return;

        if (seen.has(profileUrl)) return;

        // Try to find nearest card/container
        const card =
          link.closest('li') ||
          link.closest('.entity-result') ||
          link.closest('.reusable-search__result-container') ||
          link.parentElement;

        if (!card) return;

        // Get visible text
        const textNodes = Array.from(
          card.querySelectorAll('span, div')
        )
          .map(el => (el.innerText || '').trim())
          .filter(Boolean);

        let name = '';

        // Find probable person name
        for (const txt of textNodes) {
          if (
            txt.length > 2 &&
            txt.length < 80 &&
            /^[A-Za-zÀ-ÿ\s'.-]+$/.test(txt)
          ) {
            name = txt;
            break;
          }
        }

        if (!name) {
          name =
            link.innerText?.trim() ||
            link.textContent?.trim() ||
            '';
        }

        name = name.replace(/\s+/g, ' ').trim();

        if (!name || name.length < 2) return;

        // image
        const img = card.querySelector('img');

        const imageSrc = img?.src || '';

        seen.add(profileUrl);

        results.push({
          name,
          profile_url: profileUrl,
          img_src: imageSrc,
        });
      } catch (err) {
        console.error('extract error', err);
      }
    });

    return results;
  };

  const allResults = [];
  const globalSeen = new Set();

  await autoScroll();

  await delay(2000);

  const profiles = extractProfiles();

  console.log('profiles extracted:', profiles);

  profiles.forEach(profile => {
    if (
      !globalSeen.has(profile.profile_url) &&
      allResults.length < maxCount
    ) {
      globalSeen.add(profile.profile_url);
      allResults.push(profile);
    }
  });

  console.log('FINAL:', allResults);

  return allResults.slice(0, maxCount);
};