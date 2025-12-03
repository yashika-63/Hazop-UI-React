import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { showToast } from "../CommonUI/CommonUI";
import './Node.css';
import Recommendations from "./Recommendations";
import { strings } from "../string";

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

const NodeDetailsPopup = ({ onClose, nodeID }) => {
  const [form, setForm] = useState(initialState);
  const [rows, setRows] = useState(6);
  const [smallRows, setSmallRows] = useState(3);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
const [tempRecommendations, setTempRecommendations] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      if (name === 'causes' || name === 'consequences' || name === 'deviation') {
        const lineCount = value.split("\n").length;
        setRows(Math.min(20, Math.max(6, lineCount)));
      }

      if (name === 'additionalControl' || name === 'existineControl') {
        const lineCount = value.split("\n").length;
        setSmallRows(Math.min(10, Math.max(3, lineCount)));
      }

      if (name === 'existineProbability' || name === 'existingSeverity') {
        const probability = parseInt(updatedForm.existineProbability, 10) || 1;
        const severity = parseInt(updatedForm.existingSeverity, 10) || 1;
        updatedForm.riskRating = (probability * severity).toString();
      }

      if (name === 'additionalProbability' || name === 'additionalSeverity') {
        const probability = parseInt(updatedForm.additionalProbability, 10) || 1;
        const severity = parseInt(updatedForm.additionalSeverity, 10) || 1;
        updatedForm.additionalRiskRating = (probability * severity).toString();
      }

      return updatedForm;
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const additionalRequired = isAdditionalRequired();

  if (additionalRequired && (!form.additionalControl || !form.additionalProbability || !form.additionalSeverity)) {
    showToast("Additional Control, Probability, and Severity are required when Risk Rating is 12 or higher.", "warn");
    return;
  }

  try {
    setLoading(true);
    // Save node detail first
    const nodeDetailResponse = await fetch(
      `http://localhost:5559/api/hazopNodeDetail/saveDetails/${nodeID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([form]),
      }
    );

    if (nodeDetailResponse.ok) {
      const nodeDetailResult = await nodeDetailResponse.json();
      const nodeDetailId = nodeDetailResult.nodeDetailId;

      // Now save recommendations if any
      if (tempRecommendations.length > 0) {
        await fetch(
          `http://localhost:5559/api/nodeRecommendation/save/${nodeID}/${nodeDetailId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tempRecommendations),
          }
        );
      }

      showToast("Details and recommendations saved successfully!", "success");
      setForm(initialState);
      setTempRecommendations([]);
      onClose();
    } else {
      showToast("Failed to save details.", "error");
    }
  } catch (error) {
    console.error("Error saving details:", error);
    showToast("Error saving details.", "error");
  } finally {
    setLoading(false);
  }
};

  const isAdditionalRequired = () => {
    const riskRating = parseInt(form.riskRating, 10) || 0;
    return riskRating >= 12;
  };

  const openRecommendations = () => {
    setShowRecommendations(true);
  };

  const saveRecommendations = (recs) => {
    const bulletText = recs.map(r => `- ${r}`).join('\n');
    setForm((prev) => ({ ...prev, additionalControl: bulletText }));
    setShowRecommendations(false);
    setTempRecommendations(recs);
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
          <h2 className="modal-header">Create Node Detail</h2>
        </div>

        <div className="popup-body">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="grid-row">
                <div className="form-group">
                  <label>General Parameter</label>
                  <input
                    type="text"
                    name="generalParameter"
                    value={form.generalParameter}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Specific Parameter</label>
                  <input
                    type="text"
                    name="specificParameter"
                    value={form.specificParameter}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Guide Word</label>
                  <input
                    type="text"
                    name="guidWord"
                    value={form.guidWord}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group">
                  <label>Causes</label>
                  <textarea
                    name="causes"
                    rows={rows}
                    value={form.causes}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Consequences</label>
                  <textarea
                    name="consequences"
                    rows={rows}
                    value={form.consequences}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Deviation</label>
                  <textarea
                    name="deviation"
                    rows={rows}
                    value={form.deviation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group existing-control">
                  <label>Existing Control</label>
                  <textarea
                    name="existineControl"
                    rows={smallRows}
                    value={form.existineControl}
                    onChange={handleChange}
                  />
                </div>
                <div className="existing-metrics">
                <div className="form-group">
                  <label>Existing Probability (1–5)</label>
                  {renderScaleSelect(
                    "existineProbability",
                    form.existineProbability
                  )}
                </div>
                <div className="form-group">
                  <label>Existing Severity (1–5)</label>
                  {renderScaleSelect("existingSeverity", form.existingSeverity)}
                </div>
                <div className="form-group">
                  <label>Risk Rating</label>
                  <input
                    type="text"
                    name="riskRating"
                    value={form.riskRating}
                    onChange={handleChange}
                  />
                </div>
                </div>
              </div>

              <div className="grid-row">
                <div className="form-group existing-control">
                  <label>
                    {isAdditionalRequired() && <span className="required-marker">* </span>}Additional Control
                    <button type="button" className="add-btn" onClick={openRecommendations}>Add</button>
                  </label>
                  <textarea
                    name="additionalControl"
                    rows={smallRows}
                    value={form.additionalControl}
                    onChange={handleChange}
                    readOnly
                    className="readonly"
                  />
                </div>
                <div className="existing-metrics">
                <div className="form-group">
                  <label>
                    {isAdditionalRequired() && <span className="required-marker">* </span>}Additional Probability (1–5)
                  </label>
                  {renderScaleSelect(
                    "additionalProbability",
                    form.additionalProbability
                  )}
                </div>
                <div className="form-group">
                  <label>
                    {isAdditionalRequired() && <span className="required-marker">* </span>}Additional Severity (1–5)
                  </label>
                  {renderScaleSelect("additionalSeverity", form.additionalSeverity)}
                </div>
                <div className="form-group">
                  <label>
                    {isAdditionalRequired() && <span className="required-marker">* </span>}Additional Risk Rating
                  </label>
                  <input
                    type="text"
                    name="additionalRiskRating"
                    value={form.additionalRiskRating}
                    onChange={handleChange}
                  />
                </div>
                </div>
              </div>

              <div className="center-controls">
                <button type="button" className="outline-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="save-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
        {showRecommendations && (
          <Recommendations
            onClose={() => setShowRecommendations(false)}
            onSave={saveRecommendations}
            initialRecommendations={[]}
            nodeID={nodeID}
          />
        )}
      </div>
    </div>
  );
};

export default NodeDetailsPopup;
