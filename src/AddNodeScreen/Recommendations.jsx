import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const Recommendations = ({ onClose, onSave, initialRecommendations = [], nodeID }) => {
  // Initialize with at least one empty recommendation if initialRecommendations is empty
  const initialArray =
    Array.isArray(initialRecommendations) && initialRecommendations.length > 0
      ? initialRecommendations
      : [{ recommendation: "", remarkbyManagement: "" }];

  const [recommendations, setRecommendations] = useState(
    initialArray.map((r) => ({
      recommendation: r.recommendation || "",
      remarkbyManagement: r.remarkbyManagement || "",
    }))
  );

  const handleAdd = () => {
    setRecommendations([
      ...recommendations,
      { recommendation: "", remarkbyManagement: "" },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...recommendations];
    updated[index][field] = value;
    setRecommendations(updated);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recommendations),
        }
      );

      if (response.ok) {
        const displayText = recommendations
          .map((r) => r.recommendation)
          .filter((r) => r.trim() !== "");
        onSave(displayText);
        showToast("Recommendations saved successfully!", "success");
      } else {
        showToast("Failed to save details.", "error");
      }
    } catch (error) {
      console.error("Error saving recommendations:", error);
      showToast("Error saving details.", "error");
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-header">Recommendations</h2>
        </div>
        <div className="popup-body">
          <div className="btn-container">
            <button type="button" className="add-btn" onClick={handleAdd}>
              Add Recommendation
            </button>
          </div>

          {recommendations.map((rec, index) => (
            <div key={index} className="form-group">
              <label>Recommendation</label>
              <textarea
                type="text"
                rows={5}
                value={rec.recommendation}
                onChange={(e) =>
                  handleChange(index, "recommendation", e.target.value)
                }
              />
              <label>Remarks by Management</label>
              <input
                type="text"
                value={rec.remarkbyManagement}
                onChange={(e) =>
                  handleChange(index, "remarkbyManagement", e.target.value)
                }
              />
              <div className="underline"></div>
            </div>
          ))}

          <div className="center-controls">
            <button type="button" className="outline-btn" onClick={onClose}>
              Close
            </button>
            <button type="button" className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
