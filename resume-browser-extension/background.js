// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Wrap the entire logic in an async function to handle promises more cleanly
  const handleMessage = async () => {
    try {
      // Use a promise-based storage retrieval
      const result = await new Promise((resolve) =>
        chrome.storage.sync.get(["apiBaseUrl"], resolve)
      );

      const baseUrl = result.apiBaseUrl || "http://localhost:8080";

      if (request.action === "sendData") {
        const jobData = request.data;

        // Validate the data format
        if (!jobData) {
          throw new Error("No job data provided");
        }

        // Validate specific fields
        const requiredFields = ["content", "url", "job_find", "job_id"];
        const missingFields = requiredFields.filter((field) => !jobData[field]);

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Construct the payload
        const payload = {
          extensionId: chrome.runtime.id,
          data: jobData,
          timestamp: Date.now(),
        };

        // Improved fetch with more robust timeout and error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        try {
          const response = await fetch(`${baseUrl}/api/addJob`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const text = await response.text();
          return {
            success: true,
            message: text || "Data sent successfully",
          };
        } catch (error) {
          clearTimeout(timeoutId);

          // Differentiate between different types of errors
          if (error.name === "AbortError") {
            throw new Error("Request timed out");
          }

          throw error;
        }
      }

      // If not a sendData action, throw an error
      throw new Error("Unsupported action");
    } catch (error) {
      console.error("Error in message handler:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  };

  // Call the async handler and ensure response is sent
  handleMessage().then(sendResponse);

  // Critical: Return true to indicate async response
  return true;
});

// Optional: Add error logging for unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
