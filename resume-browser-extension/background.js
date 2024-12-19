// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendData") {
    const jobData = request.data;

    // Validate the data format
    if (
      !jobData ||
      typeof jobData.content !== "string" ||
      typeof jobData.url !== "string" ||
      typeof jobData.job_find !== "string" ||
      typeof jobData.job_id !== "string"
    ) {
      sendResponse({
        success: false,
        error:
          "Invalid data format. Expected { content, url, job_find, job_id }.",
      });
      return;
    }

    fetch("http://localhost:8000/api/addJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Server responded with ${response.status}`);
        return response.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => {
        console.error("Error sending data:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
