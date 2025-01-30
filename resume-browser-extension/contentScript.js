// contentScript.js

let overlays = [];
let selectedBlocks = [];
let observer = null;
let overlaysActive = false;
let extractedData = null;
let currentOverlay = null; // Track current overlay

const PLATFORM_SELECTORS = {
  "linkedin.com": [
    '[class*="jobs-search__job-details"]',
    '[class*="job-details"]',
    '[class*="job-view-layout"]',
  ],
  "indeed.com": [
    '[class*="jobsearch-ViewJob"]',
    '[class*="viewjob"]',
    '[class*="job-container"]',
  ],
  "joinhandshake.com": [
    '[class*="job-preview"]',
    '[class*="style__details"]',
    '[class*="job-details"]',
  ],
};

/**
 * Create an overlay for a given element.
 * @param {Element} element - The DOM element representing the job posting.
 */
function createOverlay(element) {
  const rect = element.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.classList.add("job-overlay");

  // Style the overlay
  Object.assign(overlay.style, {
    position: "absolute",
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    border: "1px solid rgba(76, 175, 80, 0.5)",
    zIndex: "9999",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  overlay.dataset.selector = getUniqueSelector(element);

  // Click handler for selection
  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (overlaysActive) {
      toggleSelection(element, overlay);
      extractAndDisplayContent(element);
    }
  });

  // Hover effect
  overlay.addEventListener("mouseover", () => {
    overlay.style.backgroundColor = "rgba(76, 175, 80, 0.2)";
    overlay.style.border = "2px solid rgba(76, 175, 80, 0.7)";
  });

  overlay.addEventListener("mouseout", () => {
    if (!overlay.classList.contains("selected")) {
      overlay.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
      overlay.style.border = "1px solid rgba(76, 175, 80, 0.5)";
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
    overlay.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
    overlay.style.border = "1px solid rgba(76, 175, 80, 0.5)";
  } else {
    selectedBlocks = [selector]; // Only allow one selection at a time
    overlays.forEach((o) => {
      o.classList.remove("selected");
      o.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
      o.style.border = "1px solid rgba(76, 175, 80, 0.5)";
    });
    overlay.classList.add("selected");
    overlay.style.backgroundColor = "rgba(0, 150, 136, 0.2)";
    overlay.style.border = "2px solid rgb(0, 150, 136)";
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
  const elements = document.querySelectorAll("div, section, article, p");
  elements.forEach((element) => {
    if (isJobPosting(element)) {
      createOverlay(element);
    }
  });
}

/**
 * Determine if a given element is a job posting block.
 * @param {Element} element - The DOM element to evaluate.
 * @returns {boolean} - True if it's a job posting, else false.
 */
function isJobPosting(element) {
  const text = element.innerText.toLowerCase();
  const keywords = ["job", "position", "career", "role", "work"];
  return (
    keywords.some((keyword) => text.includes(keyword)) &&
    element.innerText.length > 50
  );
}

/**
 * Clear all existing overlays from the page.
 */
function clearOverlays() {
  overlays.forEach((overlay) => overlay.remove());
  overlays = [];
  selectedBlocks = [];
  extractedData = null;
}

function getPlatformSelector() {
  const hostname = window.location.hostname;
  let selectors = [];

  if (hostname.includes("linkedin")) {
    selectors = PLATFORM_SELECTORS["linkedin.com"];
  } else if (hostname.includes("indeed")) {
    selectors = PLATFORM_SELECTORS["indeed.com"];
  } else if (hostname.includes("handshake")) {
    selectors = PLATFORM_SELECTORS["joinhandshake.com"];
  }

  // Return all selectors joined with comma for querySelector
  return selectors.join(",");
}

function autoExtractJobContent() {
  console.log("Attempting auto-extraction...");
  const platformSelector = getPlatformSelector();

  if (!platformSelector) {
    console.log("No platform selector found, switching to manual mode");
    return false;
  }

  // Try to find the job container
  const jobContainer = document.querySelector(platformSelector);
  if (!jobContainer) {
    console.log("No job container found with selector:", platformSelector);
    return false;
  }

  console.log("Job container found, extracting content...");

  // Extract content and send message to popup
  const content = jobContainer.innerText.trim();
  const url = window.location.href;
  const platform = getPlatform();
  const jobId = `${platform}-${Date.now()}`;

  extractedData = {
    content,
    url,
    job_find: platform,
    job_id: jobId,
  };

  // Send message to popup with extracted content
  chrome.runtime.sendMessage(
    {
      action: "contentExtracted",
      data: extractedData,
    },
    (response) => {
      console.log("Content extraction message sent:", response);
    }
  );

  createSelectedOverlay(jobContainer);
  return true;
}

function createSelectedOverlay(element) {
  removeAllOverlays();

  const selectedOverlay = document.createElement("div");
  selectedOverlay.classList.add("selected-overlay");

  Object.assign(selectedOverlay.style, {
    position: "absolute",
    backgroundColor: "rgba(0, 150, 136, 0.2)",
    border: "2px solid rgb(0, 150, 136)",
    pointerEvents: "none",
    zIndex: "9999",
  });

  positionOverlay(element, selectedOverlay);
  document.body.appendChild(selectedOverlay);
  currentOverlay = selectedOverlay;
}

// Manual selection mode functions
function handleMouseOver(event) {
  if (!overlaysActive) return;

  const element = event.target;
  if (
    element.tagName.toLowerCase() === "body" ||
    element.tagName.toLowerCase() === "html"
  )
    return;

  removeTemporaryOverlay();

  const overlay = document.createElement("div");
  overlay.classList.add("temp-overlay");

  Object.assign(overlay.style, {
    position: "absolute",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    border: "1px solid rgba(76, 175, 80, 0.5)",
    pointerEvents: "none",
    zIndex: "9999",
    transition: "all 0.2s ease",
  });

  positionOverlay(element, overlay);
  document.body.appendChild(overlay);

  element.addEventListener("click", handleElementClick);
}

function handleElementClick(event) {
  if (!overlaysActive) return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target;
  extractAndDisplayContent(element);
  createSelectedOverlay(element);
}

// Utility functions
function positionOverlay(element, overlay) {
  const rect = element.getBoundingClientRect();
  Object.assign(overlay.style, {
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
}

function removeTemporaryOverlay() {
  const tempOverlay = document.querySelector(".temp-overlay");
  if (tempOverlay) tempOverlay.remove();
}

function removeAllOverlays() {
  removeTemporaryOverlay();
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}

function extractAndDisplayContent(element) {
  const content = element.innerText.trim();
  const url = window.location.href;
  const platform = getPlatform();
  const jobId = `${platform}-${Date.now()}`;

  extractedData = {
    content,
    url,
    job_find: platform,
    job_id: jobId,
  };

  // Send message to popup with extracted content
  chrome.runtime.sendMessage(
    {
      action: "contentExtracted",
      data: extractedData,
    },
    (response) => {
      console.log("Content extraction message sent:", response);
    }
  );
}

function getPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes("linkedin")) return "linkedin";
  if (hostname.includes("indeed")) return "indeed";
  if (hostname.includes("handshake")) return "handshake";
  return "unknown";
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

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received:", request.action);

  switch (request.action) {
    case "activate":
      overlaysActive = true;
      // Try automatic extraction first
      const extracted = autoExtractJobContent();
      if (!extracted) {
        // Fall back to manual selection mode
        document.addEventListener("mouseover", handleMouseOver);
        sendResponse({
          success: true,
          message: "Switched to manual selection mode",
        });
      } else {
        sendResponse({
          success: true,
          message: "Auto-extracted job content",
        });
      }
      break;

    case "deactivate":
      overlaysActive = false;
      document.removeEventListener("mouseover", handleMouseOver);
      removeAllOverlays();
      extractedData = null;
      sendResponse({ success: true });
      break;

    case "sendData":
      if (extractedData) {
        sendResponse({ success: true, data: extractedData });
      } else {
        sendResponse({ success: false, error: "No data extracted" });
      }
      break;
  }

  return true;
});

console.log("Content script loaded");

function createPanel() {
  const panel = document.createElement("div");
  panel.className = "job-extractor-panel";
  panel.innerHTML = `
    <div class="job-extractor-header">
      <h3 class="job-extractor-title">Job Extractor</h3>
      <button class="job-extractor-minimize" title="Minimize">−</button>
    </div>
    <div class="job-extractor-content">
      <div class="job-extractor-output">
        Click 'Activate' to start extracting job content
      </div>
      <div class="job-extractor-buttons">
        <button class="job-extractor-button activate">
          ▶ Activate
        </button>
        <button class="job-extractor-button send" disabled>
          ↗ Send
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const minimizeBtn = panel.querySelector(".job-extractor-minimize");
  const activateBtn = panel.querySelector(".job-extractor-button.activate");
  const sendBtn = panel.querySelector(".job-extractor-button.send");
  const output = panel.querySelector(".job-extractor-output");

  minimizeBtn.addEventListener("click", () => toggleMinimize(panel));
  activateBtn.addEventListener("click", () =>
    handleActivate(activateBtn, sendBtn, output)
  );
  sendBtn.addEventListener("click", () =>
    handleSend(activateBtn, sendBtn, output)
  );

  document.body.appendChild(panel);
  return panel;
}

function toggleMinimize(panel) {
  if (panel.classList.contains("job-extractor-minimized")) {
    panel.classList.remove("job-extractor-minimized");
    panel.innerHTML = `
      <div class="job-extractor-header">
        <h3 class="job-extractor-title">Job Extractor</h3>
        <button class="job-extractor-minimize" title="Minimize">−</button>
      </div>
      <div class="job-extractor-content">
        <div class="job-extractor-output">
          Click 'Activate' to start extracting job content
        </div>
        <div class="job-extractor-buttons">
          <button class="job-extractor-button activate">
            ▶ Activate
          </button>
          <button class="job-extractor-button send" disabled>
            ↗ Send
          </button>
        </div>
      </div>
    `;
  } else {
    panel.classList.add("job-extractor-minimized");
    panel.innerHTML = "⊕";
  }

  // Reattach event listeners after changing innerHTML
  attachPanelListeners(panel);
}

function attachPanelListeners(panel) {
  const minimizeBtn = panel.querySelector(".job-extractor-minimize");
  const activateBtn = panel.querySelector(".job-extractor-button.activate");
  const sendBtn = panel.querySelector(".job-extractor-button.send");
  const output = panel.querySelector(".job-extractor-output");

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => toggleMinimize(panel));
  }
  if (activateBtn) {
    activateBtn.addEventListener("click", () =>
      handleActivate(activateBtn, sendBtn, output)
    );
  }
  if (sendBtn) {
    sendBtn.addEventListener("click", () =>
      handleSend(activateBtn, sendBtn, output)
    );
  }
}

// Initialize the panel when the content script loads
document.addEventListener("DOMContentLoaded", () => {
  createPanel();
});

// Update manifest.json to include the new files
