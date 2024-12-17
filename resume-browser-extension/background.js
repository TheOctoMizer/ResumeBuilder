// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendData") {
    const jobData = request.data;

    // Validate the data format
    if (!jobData || typeof jobData.content !== "string") {
      sendResponse({
        success: false,
        error:
          'Invalid data format. Expected { "content": "<string extracted>" }.',
      });
      return;
    }

    fetch("http://localhost:8000/api/addJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData), // Sends { "content": "<string extracted>" }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("Error sending data:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
