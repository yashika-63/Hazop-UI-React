import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const UpdateRecommendations = ({
  onClose,
  onSave,
  initialRecommendations = [],
  nodeID,
  nodeDetailId,
}) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState({});

  const [recommendations, setRecommendations] = useState(
    Array.isArray(initialRecommendations) && initialRecommendations.length > 0
      ? initialRecommendations
      : [{ recommendation: "", remarkbyManagement: "" }]
  );

  useEffect(() => {
    if (!nodeDetailId) {
      console.log(
        "nodeDetailId is null or undefined, not fetching recommendations."
      );
      return;
    }
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(
          `http://localhost:5559/api/nodeRecommendation/getByDetailId/${nodeDetailId}`
        );
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load recommendations.", "error");
      }
    };
    fetchRecommendations();
  }, [nodeDetailId]);

  const handleAdd = () => {
    setRecommendations([
      ...recommendations,
      { recommendation: "", remarkbyManagement: "" },
    ]);
  };

  const validate = () => {
    const newErrors = {};
    recommendations.forEach((rec, index) => {
      if (!rec.recommendation) {
        newErrors[`recommendation-${index}`] = "Recommendation is required.";
        showToast("Recommendation is required", "warn");
      }
      if (!rec.remarkbyManagement) {
        newErrors[`remarkbyManagement-${index}`] =
          "Remarks by management is required.";
        showToast("Remarks by management is required", "warn");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (Object.keys(pendingUpdates).length > 0) {
      showToast("Please click update button to save your changes!", "warn");
      return;
    }

    if (!validate()) return;

    onSave(recommendations);
    showToast("Recommendations saved successfully", "success");
    onClose();
  };

  const handleChange = (index, field, value) => {
    setPendingUpdates((prev) => ({ ...prev, [index]: true }));

    const updated = [...recommendations];
    updated[index][field] = value;
    setRecommendations(updated);
  };

  const handleIndividualUpdate = async (index) => {
    try {
      const rec = recommendations[index];

      const res = await fetch(
        `http://localhost:5559/api/nodeRecommendation/update/${rec.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rec),
        }
      );

      if (res.ok) {
        showToast("Updated successfully!", "success");
        setPendingUpdates((prev) => {
          const clone = { ...prev };
          delete clone[index];
          return clone;
        });
        setEditIndex(null);
      } else {
        showToast("Failed to update!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating record!", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-header">Update Recommendations</h2>
        </div>
        <div className="popup-body">
          <div className="rightbtn-controls">
            <button type="button" className="add-btn" onClick={handleAdd}>
              Add Recommendation
            </button>
          </div>

          {recommendations.map((rec, index) => (
            <div key={index} className="form-group">
              <label>
                {" "}
                <span className="required-marker">* </span>Recommendation
              </label>
              <textarea
                rows={5}
                value={rec.recommendation}
                readOnly={editIndex !== index}
                className={editIndex !== index ? "readonly" : ""}
                onChange={(e) =>
                  handleChange(index, "recommendation", e.target.value)
                }
              />
              <label>
                {" "}
                <span className="required-marker">* </span>Remarks by Management
              </label>
              <input
                type="text"
                value={rec.remarkbyManagement}
                onChange={(e) =>
                  handleChange(index, "remarkbyManagement", e.target.value)
                }
                readOnly={editIndex !== index}
                className={editIndex !== index ? "readonly" : ""}
              />

              <div className="rightbtn-controls">
                <button
                  className="add-btn"
                  onClick={() => {
                    if (editIndex !== index) {
                      setEditIndex(index);
                      return;
                    }

                    handleIndividualUpdate(index);
                  }}
                >
                  {editIndex === index ? "Save Update" : "Update"}
                </button>
              </div>

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

export default UpdateRecommendations;
