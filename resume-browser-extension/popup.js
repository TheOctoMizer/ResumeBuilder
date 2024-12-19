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
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "activate" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to activate overlays.";
              return;
            }
            outputDiv.textContent = response?.success
              ? "Overlays activated."
              : "Failed to activate overlays.";
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
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "deactivate" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to deactivate overlays.";
              return;
            }
            outputDiv.textContent = response?.success
              ? "Overlays deactivated."
              : "Failed to deactivate overlays.";
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
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "extract" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              outputDiv.textContent = "Failed to extract data.";
              return;
            }
            if (response?.data?.content) {
              outputDiv.textContent = `Content: ${response.data.content}\nURL: ${response.data.url}\nPlatform: ${response.data.job_find}\nJob ID: ${response.data.job_id}`;
              chrome.runtime.sendMessage(
                { action: "sendData", data: response.data },
                (bgResponse) => {
                  if (bgResponse?.success) {
                    console.log("Data successfully sent to the server.");
                  } else {
                    console.error("Failed to send data:", bgResponse?.error);
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
