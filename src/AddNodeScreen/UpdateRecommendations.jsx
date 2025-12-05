import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
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
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

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
          `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${nodeDetailId}`
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
      const newList = [
    ...recommendations,
    { recommendation: "", remarkbyManagement: "" },
  ];

  setRecommendations(newList);
  setEditIndex(newList.length - 1);
  };

  const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="confirm-overlay">
        <div className="confirm-box">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              No
            </button>
            <button type="button" onClick={onConfirm} className="confirm-btn">
              Yes
            </button>
          </div>
        </div>
      </div>
    );
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

  const handleDelete = async () => {
    const index = deleteIndex; // <-- YOU GET THE INDEX TO DELETE
    const rec = recommendations[index]; // <-- THE EXACT RECORD

    // 1️⃣ Prevent deleting if only one left
    if (recommendations.length === 1) {
      showToast("At least one recommendation is required", "warn");
      setShowDeletePopup(false);
      return;
    }

    // 2️⃣ DELETE FROM UI ONLY (if record is new and has NO id)
    if (!rec.id) {
      const updated = recommendations.filter((_, i) => i !== index);
      setRecommendations(updated);
      setShowDeletePopup(false);
      showToast("Recommendation deleted successfully", "success");
      return;
    }

    // 3️⃣ DELETE FROM DATABASE (if has ID)
    try {
      const res = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/delete/${rec.id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        const updated = recommendations.filter((_, i) => i !== index);
        setRecommendations(updated);
        showToast("Recommendation deleted successfully", "success");
      } else {
        showToast("Failed to delete recommendation!", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Error deleting recommendation!", "error");
    }

    // 4️⃣ Close popup and reset
    setShowDeletePopup(false);
    setDeleteIndex(null);
  };

const handleIndividualUpdate = async (index) => {
  try {
    const rec = recommendations[index];

    if (!rec.id) {
      const res = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}/${nodeDetailId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              recommendation: rec.recommendation,
              remarkbyManagement: rec.remarkbyManagement,
            },
          ]),
        }
      );

      if (res.ok) {
        const createdList = await res.json();
        const createdRec = createdList[0]; 

        const updated = [...recommendations];
        updated[index] = createdRec; 
        setRecommendations(updated);

        showToast("Recommendation added successfully!", "success");

        setPendingUpdates((prev) => {
          const p = { ...prev };
          delete p[index];
          return p;
        });

        setEditIndex(null);
      } else {
        showToast("Failed to add recommendation!", "error");
      }

      return;
    }

    const res = await fetch(
      `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      }
    );

    if (res.ok) {
      showToast("Updated successfully!", "success");

      setPendingUpdates((prev) => {
        const p = { ...prev };
        delete p[index];
        return p;
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
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

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
                className={`textareaFont ${
                  editIndex !== index ? "readonly" : ""
                }`}
                onChange={(e) =>
                  handleChange(index, "recommendation", e.target.value)
                }
                maxLength={3000}
              />
              <small
                className={`char-count ${
                  rec.recommendation.length >= 3000 ? "limit-reached" : ""
                }`}
              >
                {rec.recommendation.length}/3000
              </small>
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
                className={`textareaFont ${
                  editIndex !== index ? "readonly" : ""
                }`}
              />
              <small
                className={`char-count ${
                  rec.remarkbyManagement.length >= 3000 ? "limit-reached" : ""
                }`}
              >
                {rec.remarkbyManagement.length}/3000
              </small>

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
                <button
                  className="required-marker"
                  onClick={() => {
                    setDeleteIndex(index);
                    setShowDeletePopup(true);
                  }}
                  title="Delete Recommendation"
                >
                  <FaTrash />
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
          {showDeletePopup && (
            <ConfirmationPopup
              message="Are you sure you want to delete this recommendation?"
              onConfirm={handleDelete}
              onCancel={() => setShowDeletePopup(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateRecommendations;
