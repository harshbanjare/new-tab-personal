import React, { useState, useEffect } from "react";

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "FETCH_ISSUES" }, (response) => {
      console.log("Issues response:", response);
      if (response?.data?.results) {
        setIssues(response.data.results);
      } else if (response?.error) {
        setError(response.error);
      }
      setLoading(false);
    });
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#dc2626";
      case "medium":
        return "#ea580c";
      case "low":
        return "#059669";
      default:
        return "#6b7280";
    }
  };

  const getStateColor = (stateGroup) => {
    switch (stateGroup) {
      case "started":
        return "#2563eb";
      case "unstarted":
        return "#6b7280";
      case "completed":
        return "#059669";
      default:
        return "#6b7280";
    }
  };

  const getStateLabel = (stateGroup) => {
    switch (stateGroup) {
      case "started":
        return "In Progress";
      case "unstarted":
        return "Todo";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleIssueClick = (issue) => {
    // Open Plane Metaborong workspace in the same tab
    window.location.href =
      "https://plane.metaborong.com/metaborong/workspace-views/assigned/?state_group=backlog,unstarted,started";
  };

  if (loading) {
    return (
      <div
        className={`issues-floating-container ${isExpanded ? "expanded" : ""}`}
      >
        <div className="issues-header" onClick={toggleExpanded}>
          <div className="issues-title-section">
            <h2 className="issues-title">Metaborong</h2>
            <div className="issues-subtitle">Loading...</div>
          </div>
          <div className="issues-toggle">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>
        {isExpanded && (
          <div className="issues-content">
            <div className="issues-loading">
              <div className="loading-spinner"></div>
              <span>Loading issues...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`issues-floating-container ${isExpanded ? "expanded" : ""}`}
      >
        <div className="issues-header" onClick={toggleExpanded}>
          <div className="issues-title-section">
            <h2 className="issues-title">Metaborong</h2>
            <div className="issues-subtitle">Error</div>
          </div>
          <div className="issues-toggle">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>
        {isExpanded && (
          <div className="issues-content">
            <div className="issues-error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>Failed to load issues</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`issues-floating-container ${isExpanded ? "expanded" : ""}`}
    >
      <div className="issues-header" onClick={toggleExpanded}>
        <div className="issues-title-section">
          <h2 className="issues-title">Metaborong</h2>
          <div className="issues-subtitle">
            {issues.length} {issues.length === 1 ? "issue" : "issues"}
          </div>
        </div>
        <div className="issues-toggle">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="issues-content">
          {issues.length === 0 ? (
            <div className="issues-empty">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span>All caught up!</span>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="issue-item"
                  onClick={() => handleIssueClick(issue)}
                >
                  <div className="issue-main">
                    <div className="issue-title-row">
                      <h3 className="issue-name">{issue.name}</h3>
                      <span className="issue-id">
                        #{issue.issue_view_id || issue.sequence_id}
                      </span>
                    </div>

                    <div className="issue-meta-row">
                      <div className="issue-badges">
                        <span
                          className="issue-state"
                          style={{ color: getStateColor(issue.state__group) }}
                        >
                          {getStateLabel(issue.state__group)}
                        </span>
                        {issue.priority && issue.priority !== "none" && (
                          <span
                            className="issue-priority"
                            style={{
                              backgroundColor: getPriorityColor(issue.priority),
                            }}
                          >
                            {issue.priority}
                          </span>
                        )}
                      </div>

                      {issue.assignee_ids?.length > 0 && (
                        <div className="issue-assignees">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>{issue.assignee_ids.length}</span>
                        </div>
                      )}
                    </div>

                    {(issue.start_date || issue.target_date) && (
                      <div className="issue-dates">
                        {issue.target_date && (
                          <div className="issue-date">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{formatDate(issue.target_date)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuesList;
