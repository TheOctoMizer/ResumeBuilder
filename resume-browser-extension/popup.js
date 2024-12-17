// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const activateButton = document.getElementById("activate");
  const deactivateButton = document.getElementById("deactivate");
  const extractButton = document.getElementById("extract");
  const outputDiv = document.getElementById("output");

  // Activate Overlay
  activateButton.addEventListener("click", () => {
    console.log("Activate button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "activate" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to activate overlays.";
              return;
            }
            if (response && response.success) {
              console.log("Overlay activated.");
              outputDiv.textContent = "Overlays activated.";
            } else {
              outputDiv.textContent = "Failed to activate overlays.";
            }
          }
        );
      } else {
        outputDiv.textContent = "No active tab found.";
      }
    });
  });

  // Deactivate Overlay
  deactivateButton.addEventListener("click", () => {
    console.log("Deactivate button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "deactivate" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to deactivate overlays.";
              return;
            }
            if (response && response.success) {
              console.log("Overlay deactivated.");
              outputDiv.textContent = "Overlays deactivated.";
            } else {
              outputDiv.textContent = "Failed to deactivate overlays.";
            }
          }
        );
      } else {
        outputDiv.textContent = "No active tab found.";
      }
    });
  });

  // Extract Selected Data
  extractButton.addEventListener("click", () => {
    console.log("Extract button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "extract" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to extract data.";
              return;
            }
            if (response && response.data && response.data.content) {
              outputDiv.textContent = response.data.content;
              // Send data to background for further processing
              chrome.runtime.sendMessage(
                { action: "sendData", data: response.data },
                (bgResponse) => {
                  if (bgResponse && bgResponse.success) {
                    console.log("Data successfully sent to the server.");
                  } else {
                    console.error("Failed to send data:", bgResponse.error);
                  }
                }
              );
            } else {
              outputDiv.textContent = "No data extracted.";
            }
          }
        );
      } else {
        outputDiv.textContent = "No active tab found.";
      }
    });
  });
});
