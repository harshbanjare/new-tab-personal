// background.js

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FETCH_ISSUES") {
    // 1) Read both cookies
    chrome.cookies.getAll(
      { url: "https://plane.metaborong.com", name: "session-id" },
      (sessionArr) => {
        chrome.cookies.getAll(
          { url: "https://plane.metaborong.com", name: "csrftoken" },
          (csrfArr) => {
            const session = sessionArr[0]?.value;
            const csrf = csrfArr[0]?.value;

            if (!session || !csrf) {
              sendResponse({ error: "Missing session-id or csrftoken" });
              return;
            }

            // 2) Build Cookie header
            const cookieHeader = `session-id=${session}; csrftoken=${csrf}`;

            // 3) Fetch the issues endpoint
            const apiUrl =
              "https://plane.metaborong.com/api/workspaces/metaborong/issues/" +
              "?state_group=backlog,unstarted,started" +
              "&assignees=50c7cc38-21bc-4dda-acea-5b250afb2274" +
              "&order_by=-created_at" +
              "&sub_issue=false" +
              "&layout=list" +
              "&cursor=100:0:0" +
              "&per_page=100";

            fetch(apiUrl, {
              method: "GET",
              headers: {
                Cookie: cookieHeader,
                Accept: "application/json",
              },
            })
              .then((r) => r.json())
              .then((data) => sendResponse({ data }))
              .catch((err) => sendResponse({ error: err.message }));
          }
        );
      }
    );

    // return true so sendResponse can be called asynchronously
    return true;
  }
});
