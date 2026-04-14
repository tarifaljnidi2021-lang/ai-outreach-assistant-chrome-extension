// scrolling.js - Scrolling related functions

export const delayCode = `const delay = ms => new Promise(res => setTimeout(res, ms));`;

export const autoScrollCode = `const autoScroll = async () => {
  for (let i = 0; i < 6; i++) {
    window.scrollBy(0, window.innerHeight);
    await delay(800);
  }
};`;