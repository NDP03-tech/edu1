// utils/extractGaps.js
function extractFromHTML(html) {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const gaps = [];
  const dropdowns = [];
  const hintWords = [];

  let position = 0;
  const clozes = doc.querySelectorAll(".cloze");

  clozes.forEach((el) => {
    const text = el.textContent?.trim();
    const length = text?.length || 0;

    if (!text) return;

    if (el.classList.contains("dropdown")) {
      try {
        const raw = el.getAttribute("data-options");
        const options = JSON.parse(raw || "[]");
        const correct = el.getAttribute("data-answer");
        dropdowns.push({ options, correct_answer: correct, position, length });
      } catch (e) {
        console.error("❌ Failed to parse dropdown:", e);
      }
    } else {
      gaps.push({ correct_answers: [text], position, length });
    }

    position++;
  });

  const hints = doc.querySelectorAll(".hint-wrapper");
  hints.forEach((el) => {
    const word = el.querySelector(".cloze")?.textContent?.trim();
    const hint = el.querySelector(".hint-icon")?.getAttribute("data-hint");
    if (word && hint) {
      hintWords.push({ word, hint });
    }
  });

  return { gaps, dropdowns, hintWords };
}

module.exports = extractFromHTML;
