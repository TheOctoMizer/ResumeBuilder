// contentScript.js

let overlays = [];
let selectedBlocks = [];
let observer = null;

/**
 * Create an overlay for a given element.
 * @param {Element} element - The DOM element representing the job posting.
 */
function createOverlay(element) {
  const rect = element.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.classList.add("job-overlay");
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.dataset.selector = getUniqueSelector(element);

  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSelection(element, overlay);
  });

  overlay.addEventListener("mouseover", () => {
    const selector = overlay.dataset.selector;
    const el = document.querySelector(selector);
    if (el) {
      // Extract data to display in tooltip
      const title = el.querySelector(".job-title")?.innerText.trim() || "N/A";
      const company =
        el.querySelector(".company-name")?.innerText.trim() || "N/A";
      const location =
        el.querySelector(".job-location")?.innerText.trim() || "N/A";

      const content =
        el.querySelector(".job-description")?.innerText.trim() || "N/A";
      createTooltip(overlay, { title, company, location });

      // Extract all fields into one
      // const data = querySelectorAll(el);
      // createTooltip(overlay, data);
    }
  });

  document.body.appendChild(overlay);
  overlays.push(overlay);
}

/**
 * Toggle the selection state of a block.
 * @param {Element} element - The DOM element representing the job posting.
 * @param {HTMLElement} overlay - The overlay element corresponding to the job posting.
 */
function toggleSelection(element, overlay) {
  const selector = overlay.dataset.selector;
  if (selectedBlocks.includes(selector)) {
    selectedBlocks = selectedBlocks.filter((sel) => sel !== selector);
    overlay.classList.remove("selected");
  } else {
    selectedBlocks.push(selector);
    overlay.classList.add("selected");
  }
}

// Utility to get a unique CSS selector for an element
/**
 * Generate a unique CSS selector for a given element.
 * @param {Element} el - The DOM element.
 * @returns {string} - The unique CSS selector.
 */
function getUniqueSelector(el) {
  if (!(el instanceof Element)) return;
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      let sib = el,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

/**
 * Identify potential job posting blocks on the page.
 */
function identifyJobBlocks() {
  // Customize this selector based on the target website's structure
  const possibleBlocks = document.querySelectorAll("div, section, article");
  possibleBlocks.forEach((block) => {
    if (isJobPosting(block)) {
      // Avoid creating multiple overlays for the same element
      const selector = getUniqueSelector(block);
      if (!overlays.some((overlay) => overlay.dataset.selector === selector)) {
        createOverlay(block);
      }
    }
  });
}

/**
 * Determine if a given element is a job posting block.
 * @param {Element} element - The DOM element to evaluate.
 * @returns {boolean} - True if it's a job posting, else false.
 */
function isJobPosting(element) {
  // Implement logic based on common job posting attributes
  // Example: Check for keywords, specific class names, presence of job-specific fields, etc.
  const keywords = [
    "job",
    "career",
    "position",
    "employment",
    "vacancy",
    "opportunity",
  ];
  const text = element.innerText.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Clear all existing overlays from the page.
 */
function clearOverlays() {
  overlays.forEach((overlay) => overlay.remove());
  overlays = [];
  selectedBlocks = [];
}

/**
 * Extract structured data from selected job posting blocks as a single string.
 * @returns {Object} - An object containing the concatenated content.
 */
function extractData() {
  const contents = selectedBlocks
    .map((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        return el.innerText.trim(); // Use innerHTML if you prefer to keep HTML structure
      }
      return null;
    })
    .filter((item) => item !== null);

  const concatenatedContent = contents.join("\n\n"); // Separate entries by double newline

  return { content: concatenatedContent };
}

/**
 * Create a tooltip for a given overlay.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} jobData - The structured job data.
 */
function createTooltip(overlay, jobData) {
  const tooltip = document.createElement("div");
  tooltip.classList.add("job-tooltip");
  tooltip.innerHTML = `
    <strong>${jobData.title}</strong><br>
    ${jobData.company} - ${jobData.location}
  `;
  document.body.appendChild(tooltip);

  // Position the tooltip above the overlay
  const rect = overlay.getBoundingClientRect();
  tooltip.style.top = `${rect.top + window.scrollY - 60}px`; // 60px above
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  // Remove tooltip when not hovering
  overlay.addEventListener(
    "mouseout",
    () => {
      tooltip.remove();
    },
    { once: true }
  );
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in content script:", request);
  if (request.action === "activate") {
    identifyJobBlocks();
    // Start observing DOM changes
    if (!observer) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          identifyJobBlocks();
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    sendResponse({ success: true });
  } else if (request.action === "deactivate") {
    clearOverlays();
    // Disconnect Mutation Observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    sendResponse({ success: true });
  } else if (request.action === "extract") {
    const data = extractData();
    sendResponse({ success: true, data });
  }
  return true; // Indicates that the response is sent asynchronously
});

console.log("Content script loaded");
