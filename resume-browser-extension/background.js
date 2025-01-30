// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Retrieve the stored API base URL before making any requests
  chrome.storage.sync.get(["apiBaseUrl"], function (result) {
    const baseUrl = result.apiBaseUrl || "http://localhost:8080";

    if (request.action === "sendData") {
      const jobData = request.data;

      // Validate the data format with more detailed logging
      if (!jobData) {
        console.error("No job data received");
        sendResponse({
          success: false,
          error: "No job data provided",
        });
        return;
      }

      // Validate specific fields with more granular checks
      const requiredFields = ["content", "url", "job_find", "job_id"];
      const missingFields = requiredFields.filter((field) => !jobData[field]);

      if (missingFields.length > 0) {
        console.error(`Missing fields: ${missingFields.join(", ")}`);
        sendResponse({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      // Construct the data in the format expected by the backend
      const payload = {
        extensionId: chrome.runtime.id,
        data: jobData,
        timestamp: Date.now(),
      };

      // Add timeout and more robust error handling
      const fetchWithTimeout = (url, options, timeout = 5000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      fetchWithTimeout(`${baseUrl}/api/addJob`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const text = await response.text();
          return text === "Data collected successfully"
            ? { success: true, message: text }
            : { success: false, message: text };
        })
        .then((result) => sendResponse(result))
        .catch((error) => {
          console.error("Error sending data:", error);
          sendResponse({
            success: false,
            error: error.message || "Unknown error occurred",
          });
        });

      return true; // Indicates we wish to send a response asynchronously
    }
  });
});
