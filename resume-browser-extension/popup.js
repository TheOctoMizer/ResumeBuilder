// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const activateButton = document.getElementById("activate");
  const deactivateButton = document.getElementById("deactivate");
  const sendButton = document.getElementById("send");
  const outputDiv = document.getElementById("output");
  const apiUrlInput = document.getElementById("apiUrl");
  const saveUrlButton = document.getElementById("saveUrl");

  // Initially disable send button
  sendButton.disabled = true;

  activateButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        outputDiv.textContent = "Attempting to extract job content...";

        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "activate" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError);
              outputDiv.textContent = "Error activating content extraction";
              return;
            }

            if (response.message.includes("manual")) {
              outputDiv.textContent =
                "Manual mode: Click on the content you want to extract";
            }
            // Don't update the output text for automatic mode here
            // as it will be updated when content is extracted
          }
        );
      }
    });
  });

  deactivateButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "deactivate" },
          (response) => {
            outputDiv.textContent = "Overlays deactivated";
            sendButton.disabled = true;
          }
        );
      }
    });
  });

  sendButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        try {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "sendData" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                return;
              }

              if (response?.success) {
                chrome.runtime.sendMessage(
                  { action: "sendData", data: response.data },
                  (bgResponse) => {
                    if (chrome.runtime.lastError) {
                      console.error("Error:", chrome.runtime.lastError);
                      return;
                    }

                    if (bgResponse?.success) {
                      // First update the UI
                      outputDiv.textContent =
                        bgResponse.message || "Data sent successfully!";
                      sendButton.disabled = true;

                      // Then deactivate the overlay
                      chrome.tabs.sendMessage(
                        tabs[0].id,
                        { action: "deactivate" },
                        () => {
                          if (chrome.runtime.lastError) {
                            console.error(
                              "Error deactivating:",
                              chrome.runtime.lastError
                            );
                            return;
                          }

                          // Re-enable the activate button for next selection
                          activateButton.disabled = false;
                          console.log("Ready for next job listing");
                        }
                      );
                    } else {
                      outputDiv.textContent = `Failed to send: ${
                        bgResponse?.error ||
                        bgResponse?.message ||
                        "Unknown error"
                      }`;
                    }
                  }
                );
              }
            }
          );
        } catch (error) {
          console.error("Error sending message:", error);
          outputDiv.textContent = "Error sending data";
        }
      }
    });
  });

  // Listen for content extraction
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Popup received message:", request);

    if (request.action === "contentExtracted") {
      try {
        // Format the preview text
        const previewText = request.data.content
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 200);

        // Update the output text
        outputDiv.textContent = `Extracted content preview:\n${previewText}...`;

        // Show word count
        const wordCount = request.data.content.trim().split(/\s+/).length;
        outputDiv.textContent += `\n\nTotal words: ${wordCount}`;

        // Enable the send button
        sendButton.disabled = false;

        sendResponse({ success: true });
      } catch (error) {
        console.error("Error handling content extraction:", error);
        outputDiv.textContent = "Error displaying extracted content";
        sendResponse({ success: false, error: error.message });
      }
    }
    return true;
  });

  // URL configuration handlers
  chrome.storage.sync.get(["apiBaseUrl"], function (result) {
    if (result.apiBaseUrl) {
      apiUrlInput.value = result.apiBaseUrl;
    }
  });

  saveUrlButton.addEventListener("click", function () {
    const apiUrl = apiUrlInput.value.trim();
    try {
      new URL(apiUrl);
      chrome.storage.sync.set({ apiBaseUrl: apiUrl }, function () {
        alert("API URL saved successfully!");
      });
    } catch (error) {
      alert("Please enter a valid URL");
    }
  });
});
