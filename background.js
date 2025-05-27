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

            // 3) Fetch projects first
            const projectsUrl =
              "https://plane.metaborong.com/api/workspaces/metaborong/projects/";

            fetch(projectsUrl, {
              method: "GET",
              headers: {
                Cookie: cookieHeader,
                Accept: "application/json",
              },
            })
              .then((r) => r.json())
              .then((projectsData) => {
                // Create a map of project_id to project data
                const projectsMap = {};
                projectsData.forEach((project) => {
                  projectsMap[project.id] = project;
                });

                // 4) Fetch the issues endpoint
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
                  .then((issuesData) => {
                    // Map project data to issues and add issue_view_id
                    if (issuesData.results) {
                      issuesData.results = issuesData.results.map((issue) => {
                        const project = projectsMap[issue.project_id];
                        return {
                          ...issue,
                          project: project || null,
                          issue_view_id: project
                            ? `${project.identifier}-${issue.sequence_id}`
                            : `UNKNOWN-${issue.sequence_id}`,
                        };
                      });
                    }
                    sendResponse({ data: issuesData, projects: projectsData });
                  })
                  .catch((err) => sendResponse({ error: err.message }));
              })
              .catch((err) => sendResponse({ error: err.message }));
          }
        );
      }
    );

    // return true so sendResponse can be called asynchronously
    return true;
  }
});
