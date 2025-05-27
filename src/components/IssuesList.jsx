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
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStateColor = (stateGroup) => {
    switch (stateGroup) {
      case "started":
        return "#3b82f6";
      case "unstarted":
        return "#6b7280";
      case "completed":
        return "#10b981";
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
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
              width="20"
              height="20"
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
              <p>Loading issues...</p>
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
            <div className="issues-subtitle">Error loading</div>
          </div>
          <div className="issues-toggle">
            <svg
              width="20"
              height="20"
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
              <p>Failed to load issues</p>
              <span>{error}</span>
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
            width="20"
            height="20"
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
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <p>No issues found</p>
              <span>All caught up!</span>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div key={issue.id} className="issue-item">
                  <div className="issue-header">
                    <div className="issue-name">{issue.name}</div>
                    <div
                      className="issue-priority"
                      style={{
                        backgroundColor: getPriorityColor(issue.priority),
                      }}
                    >
                      {issue.priority || "none"}
                    </div>
                  </div>

                  <div className="issue-meta">
                    <div
                      className="issue-state"
                      style={{ color: getStateColor(issue.state__group) }}
                    >
                      {getStateLabel(issue.state__group)}
                    </div>
                    <div className="issue-id">#{issue.sequence_id}</div>
                  </div>

                  {(issue.start_date || issue.target_date) && (
                    <div className="issue-dates">
                      {issue.start_date && (
                        <div className="issue-date">
                          <span className="date-label">Start:</span>
                          <span className="date-value">
                            {formatDate(issue.start_date)}
                          </span>
                        </div>
                      )}
                      {issue.target_date && (
                        <div className="issue-date">
                          <span className="date-label">Target:</span>
                          <span className="date-value">
                            {formatDate(issue.target_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {issue.assignee_ids?.length > 0 && (
                    <div className="issue-assignees">
                      <span className="assignees-label">Assignees:</span>
                      <span className="assignees-count">
                        {issue.assignee_ids.length}
                      </span>
                    </div>
                  )}
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
