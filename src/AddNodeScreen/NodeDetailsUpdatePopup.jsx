import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { showToast } from "../CommonUI/CommonUI";
import "./Node.css";
import Recommendations from "./Recommendations";
import { strings } from "../string";
import UpdateRecommendations from "./UpdateRecommendations";

const initialState = {
  generalParameter: "",
  specificParameter: "",
  guidWord: "",
  deviation: "",
  causes: "",
  consequences: "",
  existineControl: "",
  existineProbability: "",
  existingSeverity: "",
  riskRating: "",
  additionalControl: "",
  additionalProbability: "",
  additionalSeverity: "",
  additionalRiskRating: "",
};

const NodeDetailsUpdatePopup = ({ onClose, nodeID, detail, onSave }) => {
  const [form, setForm] = useState(initialState);
  const [rows, setRows] = useState(6);
  const [smallRows, setSmallRows] = useState(3);
  const [loading, setLoading] = useState(false);
  const [originalForm, setOriginalForm] = useState(initialState);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [tempRecommendations, setTempRecommendations] = useState([]);
  const [nodeDetailId, setNodeDetailId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      if (
        name === "causes" ||
        name === "consequences" ||
        name === "deviation"
      ) {
        const lineCount = value.split("\n").length;
        setRows(Math.min(20, Math.max(6, lineCount)));
      }

      if (name === "additionalControl" || name === "existineControl") {
        const lineCount = value.split("\n").length;
        setSmallRows(Math.min(10, Math.max(3, lineCount)));
      }

      if (name === "existineProbability" || name === "existingSeverity") {
        const probability = parseInt(updatedForm.existineProbability, 10) || 1;
        const severity = parseInt(updatedForm.existingSeverity, 10) || 1;
        updatedForm.riskRating = (probability * severity).toString();
      }

      if (name === "additionalProbability" || name === "additionalSeverity") {
        const probability =
          parseInt(updatedForm.additionalProbability, 10) || 1;
        const severity = parseInt(updatedForm.additionalSeverity, 10) || 1;
        updatedForm.additionalRiskRating = (probability * severity).toString();
      }

      return updatedForm;
    });
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/${detail.id}`
        );

        if (!res.ok) return;

        const data = await res.json();

        const detailData = Array.isArray(data) ? data[0] : data;

        const filled = {
          ...initialState,
          ...detailData,
          id: detailData.id,
        };

        setForm(filled);
        setOriginalForm(filled);
        setNodeDetailId(detailData.id);
      } catch (err) {
        showToast("Failed to load details for update.", "error");
      }
    };

    if (detail?.id) fetchDetail();
  }, [detail]);

  const openRecommendations = () => {
    setShowRecommendations(true);
  };

  const saveRecommendations = (recs) => {
    const bulletText = recs.map((r) => `• ${r.recommendation}`).join("\n");

    setForm((prev) => ({ ...prev, additionalControl: bulletText }));
    setShowRecommendations(false);
  };

  const validate = () => {
  if (!form.generalParameter.trim()) {
    showToast("General Parameter is required.", "warn");
    return false;
  }
  if (!form.specificParameter.trim()) {
    showToast("Specific Parameter is required.", "warn");
    return false;
  }
  if (!form.guidWord.trim()) {
    showToast("Guide Word is required.", "warn");
    return false;
  }
  if (!form.causes.trim()) {
    showToast("Causes is required.", "warn");
    return false;
  }
  if (!form.consequences.trim()) {
    showToast("Consequences is required.", "warn");
    return false;
  }
  if (!form.deviation.trim()) {
    showToast("Deviation is required.", "warn");
    return false;
  }
  if (!form.existineControl.trim()) {
    showToast("Existing Control is required.", "warn");
    return false;
  }
  if (!form.existineProbability) {
    showToast("Existing Probability is required.", "warn");
    return false;
  }
  if (!form.existingSeverity) {
    showToast("Existing Severity is required.", "warn");
    return false;
  }
  if (!form.riskRating) {
    showToast("Risk Rating is required.", "warn");
    return false;
  }

  // Extra validation when riskRating ≥ 12
  if (isAdditionalRequired()) {
    if (!form.additionalControl.trim()) {
      showToast(
        "Additional Control is required when Risk Rating is 12 or higher.",
        "warn"
      );
      return false;
    }
    if (!form.additionalProbability) {
      showToast(
        "Additional Probability is required when Risk Rating is 12 or higher.",
        "warn"
      );
      return false;
    }
    if (!form.additionalSeverity) {
      showToast(
        "Additional Severity is required when Risk Rating is 12 or higher.",
        "warn"
      );
      return false;
    }
  }

  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const additionalRequired = isAdditionalRequired();

    if (
      additionalRequired &&
      (!form.additionalControl ||
        !form.additionalProbability ||
        !form.additionalSeverity)
    ) {
      showToast(
        "Additional Control, Probability, and Severity are required when Risk Rating is 12 or higher.",
        "warn"
      );
      return;
    }

    const changedFields = {};
    Object.keys(form).forEach((key) => {
      if (form[key] !== originalForm[key]) {
        changedFields[key] = form[key];
      }
    });
    changedFields.id = form.id;

    try {
      setLoading(true);
      const response = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/update/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(changedFields),
        }
      );

      if (response.ok) {
        await response.text();
        showToast("Details updated successfully!", "success");
        try {
          if (onSave) {
            await onSave();
          }
        } catch (e) {
          console.error("onSave failed:", e);
        }
        setTimeout(() => {
          onClose();
        }, 0);
      } else {
        const errorText = await response.text();
        showToast("Failed to update details.", "error");
      }
    } catch (error) {
      // showToast("Error updating details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isAdditionalRequired = () => {
    const riskRating = parseInt(form.riskRating, 10) || 0;
    return riskRating >= 12;
  };

  const renderScaleSelect = (name, value) => (
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className="form-group"
    >
      <option value="">Select a number</option>
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-header">Update Node Detail</h2>
        </div>

        <div className="popup-body">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="grid-row">
                <div className="form-group">
                  <span className="required-marker">*</span>General Parameter
                  <input
                    type="text"
                    name="generalParameter"
                    value={form.generalParameter ?? ""}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                  <small
                    className={`char-count ${
                      form.generalParameter.length >= 1000
                        ? "limit-reached"
                        : ""
                    }`}
                  >
                    {form.generalParameter.length}/1000
                  </small>
                </div>
                <div className="form-group">
                  <span className="required-marker">*</span>Specific Parameter
                  <input
                    type="text"
                    name="specificParameter"
                    value={form.specificParameter ?? ""}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                  <small
                    className={`char-count ${
                      form.specificParameter.length >= 1000
                        ? "limit-reached"
                        : ""
                    }`}
                  >
                    {form.specificParameter.length}/1000
                  </small>
                </div>
                <div className="form-group">
                  <span className="required-marker">*</span>Guide Word
                  <input
                    type="text"
                    name="guidWord"
                    value={form.guidWord ?? ""}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                  <small
                    className={`char-count ${
                      form.guidWord.length >= 1000 ? "limit-reached" : ""
                    }`}
                  >
                    {form.guidWord.length}/1000
                  </small>
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group">
                  <span className="required-marker">*</span>Causes
                  <textarea
                    name="causes"
                    rows={rows}
                    value={form.causes ?? ""}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                  />
                  <small
                    className={`char-count ${
                      form.causes.length >= 5000 ? "limit-reached" : ""
                    }`}
                  >
                    {form.causes.length}/5000
                  </small>
                </div>
                <div className="form-group">
                  <span className="required-marker">*</span>Consequences
                  <textarea
                    name="consequences"
                    rows={rows}
                    value={form.consequences ?? ""}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                  />
                  <small
                    className={`char-count ${
                      form.consequences.length >= 5000 ? "limit-reached" : ""
                    }`}
                  >
                    {form.consequences.length}/5000
                  </small>
                </div>
                <div className="form-group">
                  <span className="required-marker">*</span>Deviation
                  <textarea
                    name="deviation"
                    rows={rows}
                    value={form.deviation ?? ""}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                  />
                  <small
                    className={`char-count ${
                      form.deviation.length >= 5000 ? "limit-reached" : ""
                    }`}
                  >
                    {form.deviation.length}/5000
                  </small>
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group existing-control">
                  <span className="required-marker">*</span>Existing Control
                  <textarea
                    name="existineControl"
                    rows={smallRows}
                    value={form.existineControl ?? ""}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                  />
                  <small
                    className={`char-count ${
                      form.existineControl.length >= 5000 ? "limit-reached" : ""
                    }`}
                  >
                    {form.existineControl.length}/5000
                  </small>
                </div>
                <div className="existing-metrics">
                  <div className="form-group">
                    <span className="required-marker">*</span>Existing
                    Probability (1–5)
                    {renderScaleSelect(
                      "existineProbability",
                      form.existineProbability
                    )}
                  </div>
                  <div className="form-group">
                    <span className="required-marker">*</span>Existing Severity
                    (1–5)
                    {renderScaleSelect(
                      "existingSeverity",
                      form.existingSeverity
                    )}
                  </div>
                  <div className="form-group">
                    <span className="required-marker">*</span>Risk Rating
                    <input
                      type="text"
                      name="riskRating"
                      value={form.riskRating ?? ""}
                      onChange={handleChange}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group existing-control">
                  <div className="label-row">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">*</span>
                      )}
                      Additional Control
                    </label>

                    <button
                      type="button"
                      className="add-btn"
                      onClick={openRecommendations}
                    >
                      Add
                    </button>
                  </div>
                  <textarea
                    name="additionalControl"
                    rows={smallRows}
                    value={form.additionalControl ?? ""}
                    onChange={handleChange}
                    readOnly
                    className="readonly textareaFont"
                  />
                </div>
                <div className="existing-metrics">
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">*</span>
                      )}
                      Additional Probability (1–5)
                    </label>
                    {renderScaleSelect(
                      "additionalProbability",
                      form.additionalProbability
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">*</span>
                      )}
                      Additional Severity (1–5)
                    </label>
                    {renderScaleSelect(
                      "additionalSeverity",
                      form.additionalSeverity
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">*</span>
                      )}
                      Additional Risk Rating
                    </label>
                    <input
                      type="text"
                      name="additionalRiskRating"
                      value={form.additionalRiskRating ?? ""}
                      onChange={handleChange}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>
              </div>

              <div className="center-controls">
                <button type="button" className="outline-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  // onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
        {showRecommendations && (
          <UpdateRecommendations
            onClose={() => setShowRecommendations(false)}
            onSave={saveRecommendations}
            initialRecommendations={[]}
            nodeID={nodeID}
            nodeDetailId={nodeDetailId}
          />
        )}
      </div>
    </div>
  );
};

export default NodeDetailsUpdatePopup;
