import { useState } from "react";

function ShowMoreText({ text, previewLength = 250 }) {
  const [expanded, setExpanded] = useState(false);

  const preview = text?.slice(0, previewLength);

  return (
    <div>
      <div className="showmore-text">
        {expanded ? text : preview + (text.length > previewLength ? "..." : "")}
      </div>

      {text.length > previewLength && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="showmore-btn"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
