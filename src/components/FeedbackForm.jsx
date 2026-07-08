import React, { useState } from "react";

/**
 * FeedbackForm component for rating the user experience and submitting commentaries.
 * 
 * @param {Object} props
 * @param {Function} props.submitFeedback - Global state callback to register feedback
 */
export function FeedbackForm({ submitFeedback }) {
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!fbComment.trim()) return;
    submitFeedback(fbRating, fbComment);
    setFbSubmitted(true);
    setTimeout(() => {
      setFbRating(5);
      setFbComment("");
      setFbSubmitted(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {fbSubmitted && (
        <div className="badge-status badge-resolved" style={{ padding: "10px", borderRadius: "6px" }}>
          <span>✓ Thank you! Feedback recorded for KPI analysis.</span>
        </div>
      )}
      <div className="input-group">
        <label htmlFor="fb-rating-select" className="input-label">Rating Experience</label>
        <select 
          id="fb-rating-select"
          className="form-input"
          value={fbRating}
          onChange={(e) => setFbRating(Number(e.target.value))}
        >
          <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
          <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
          <option value={3}>⭐⭐⭐ (Average)</option>
          <option value={2}>⭐⭐ (Poor)</option>
          <option value={1}>⭐ (Terrible)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="fb-comment-input" className="input-label">Comments / Suggestions</label>
        <textarea 
          id="fb-comment-input"
          className="form-input" 
          rows="2" 
          placeholder="Help us improve gates flow, clean facilities, or food times..." 
          value={fbComment}
          onChange={(e) => setFbComment(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="interactive-btn secondary" style={{ marginTop: "6px" }}>
        Submit Experience Score
      </button>
    </form>
  );
}
