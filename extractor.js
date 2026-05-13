// extractor.js

export const extractFunc = async (maxCountArg = 100) => {
  // -----------------------------------
  // HELPERS
  // -----------------------------------

  const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const cleanText = (txt = "") =>
    txt.replace(/\s+/g, " ").trim();

  const maxCount =
    typeof maxCountArg === "number"
      ? maxCountArg
      : parseInt(maxCountArg, 10) || 100;

  console.log("🚀 extractor started");
  console.log("🎯 target count:", maxCount);

  // -----------------------------------
  // SCROLL
  // -----------------------------------

const autoScroll = async () => {
  let lastHeight = 0;

  for (let i = 0; i < 15; i++) {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });

    await delay(1500);

    const newHeight =
      document.body.scrollHeight;

    console.log(
      `📜 scroll iteration ${i + 1}`,
      newHeight
    );

    // no more content loaded
    if (newHeight === lastHeight) {
      console.log('✅ reached page bottom');
      break;
    }

    lastHeight = newHeight;
  }
};

  // -----------------------------------
  // PAGINATION
  // -----------------------------------

const goToNextPage = async () => {
  const nextButton = document.querySelector(
    '.artdeco-pagination__button--next'
  );

  console.log(
    'next button:',
    nextButton
  );

  if (!nextButton) {
    console.log('❌ next button not found');
    return false;
  }

  if (
    nextButton.disabled ||
    nextButton.hasAttribute('disabled')
  ) {
    console.log('⛔ next disabled');
    return false;
  }

  console.log('➡️ clicking next');

  nextButton.click();

  // wait linkedin rerender
  await delay(3000);

  // reset top
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  await delay(1000);

  return true;
};

  // -----------------------------------
  // PROFILE EXTRACTION
  // -----------------------------------

  const extractProfiles = async () => {
    const results = [];
    const seen = new Set();

    const cards = Array.from(
      document.querySelectorAll(
        "[data-chameleon-result-urn]"
      )
    );

    console.log("🧩 cards found:", cards.length);
    console.log("📍 page title:", document.title);
    console.log("📍 page URL:", window.location.href);

    if (cards.length === 0) {
      console.warn("⚠️ No cards found with selector '[data-chameleon-result-urn]'");
      console.warn("Available elements:", document.querySelectorAll('[class*="result"]').length);
    }

    cards.forEach((card, index) => {
      try {
        // ---------------------------------
        // PROFILE URL
        // ---------------------------------

        const profileLink = card.querySelector(
          'a[href*="/in/"]'
        );

        if (!profileLink?.href) {
          console.log(
            `❌ card ${index}: missing profile URL`
          );
          return;
        }

        const profile_url = profileLink.href
          .split("?")[0]
          .trim();

        if (
          !profile_url ||
          !profile_url.includes("/in/")
        ) {
          console.log(
            `❌ card ${index}: invalid profile URL`
          );
          return;
        }

        if (seen.has(profile_url)) {
          console.log(
            `⚠️ duplicate skipped: ${profile_url}`
          );
          return;
        }

        // ---------------------------------
        // NAME
        // ---------------------------------

        let name = "";

        const nameEl =
          card.querySelector(
            '.t-16 a span[aria-hidden="true"]'
          ) ||
          card.querySelector(
            'span[aria-hidden="true"]'
          );

        if (nameEl) {
          name = cleanText(nameEl.textContent);
        }

        // fallback from image alt
        if (!name) {
          name = cleanText(
            card.querySelector("img")?.alt || ""
          );
        }

        if (!name) {
          name = "Unknown";
        }

        // ---------------------------------
        // TITLE
        // ---------------------------------

        let title = "";

        const titleEl = card.querySelector(
          ".t-14.t-black.t-normal"
        );

        if (titleEl) {
          title = cleanText(titleEl.textContent);
        }

        // ---------------------------------
        // LOCATION
        // ---------------------------------

        let location = "";

        const locationEls = Array.from(
          card.querySelectorAll(".t-14.t-normal")
        );

        if (locationEls.length > 0) {
          location = cleanText(
            locationEls[0].textContent
          );
        }

        // ---------------------------------
        // IMAGE
        // ---------------------------------

        let img_src = "";

        const imgEl = card.querySelector("img");

        if (imgEl?.src) {
          img_src = imgEl.src;
        }

        // ---------------------------------
        // SAVE
        // ---------------------------------

        seen.add(profile_url);

        results.push({
          name,
          title,
          location,
          profile_url,
          img_src,
        });
      } catch (err) {
        console.error(
          `❌ card ${index} extraction error`,
          err
        );
      }
    });

    console.log(
      "📦 FINAL EXTRACTED:",
      results.length
    );

    return results;
  };

  // -----------------------------------
  // MAIN LOOP
  // -----------------------------------

  const allResults = [];
  const globalSeen = new Set();

  while (allResults.length < maxCount) {
    console.log(
      `\n📄 START PAGE | ${allResults.length}/${maxCount}`
    );

    // load lazy cards
    await autoScroll();

    await delay(1000);

    // retry extraction with multiple attempts
    let pageResults = [];

    for (let retry = 0; retry < 3; retry++) {
      pageResults = await extractProfiles();

      if (pageResults.length > 0) {
        break;
      }

      console.log(
        `⏳ retry ${retry + 1}/3 - scrolling more and waiting...`
      );

      // Try scrolling more to load lazy cards
      await autoScroll();
      await delay(2000);
    }

    console.log(
      `📦 page extracted: ${pageResults.length}`
    );

    // merge unique profiles
    for (const profile of pageResults) {
      if (
        !globalSeen.has(profile.profile_url) &&
        allResults.length < maxCount
      ) {
        globalSeen.add(profile.profile_url);
        allResults.push(profile);
      }
    }

    console.log(
      `✅ TOTAL COLLECTED: ${allResults.length}/${maxCount}`
    );

    // Send progress update via window.postMessage
    try {
      window.postMessage({
        type: 'EXTRACTION_PROGRESS',
        current: allResults.length,
        total: maxCount
      }, '*');
      console.log(`📨 Progress message sent: ${allResults.length}/${maxCount}`);
    } catch (err) {
      console.log('Could not send progress:', err.message);
    }

    // enough profiles
    if (allResults.length >= maxCount) {
      break;
    }

    // next page
    const moved = await goToNextPage();

    if (!moved) {
      console.log("⛔ no more pages");
      break;
    }
  }

  console.log(
    "🎉 FINAL RESULTS:",
    allResults.length
  );

  return allResults.slice(0, maxCount);
};