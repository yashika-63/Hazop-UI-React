import React, { useState } from "react";
import axios from "axios";
import "./Node.css";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaSubscript, FaSuperscript } from "react-icons/fa";

const NodePopup = ({ onSave }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { registrationId: registrationId, hazopData } = location.state || {};

  if (!hazopData) {
    console.error("hazopData missing in NodePopup");
  }

  const [form, setForm] = useState({
    date: "",
    designIntent: "",
    pIdRevision: "",
    sopNo: "",
    sopDate: "",
    equipment: "",
    controls: "",
    chemicalAndUtilities: "",
    temperature: "",
    pressure: "",
    quantityFlowRate: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 1. Mappings for Subscript and Superscript ---
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'x': 'ₓ', 'y': 'ᵧ'
  };

  const supMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ'
  };

  // --- 2. Helper to Format Selected Text ---
  const formatSelection = (fieldName, type) => {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentText = form[fieldName] || "";

    if (start === end) {
      showToast("Please highlight the text/numbers you want to format first.", "info");
      return;
    }

    const selectedText = currentText.substring(start, end);
    const map = type === 'sub' ? subMap : supMap;

    let convertedText = "";
    for (let char of selectedText) {
      convertedText += map[char] || char;
    }

    const newText = currentText.substring(0, start) + convertedText + currentText.substring(end);

    setForm(prev => ({ ...prev, [fieldName]: newText }));

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + convertedText.length, start + convertedText.length);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.date) {
      newErrors.date = "Date is required.";
      showToast("Date is required", "warn");
    }
    if (!form.designIntent.trim()) {
      newErrors.designIntent = "Design intent is required.";
      showToast("Design Intent is required", "warn");
    }
    if (!form.pIdRevision) {
      newErrors.pIdRevision = "P&ID No. & Revision is required.";
      showToast("P&ID No. is required", "warn");
    }
    if (!form.sopNo.trim()) {
      newErrors.sopNo = "SOP Number is required.";
      showToast("SOP number is required", "warn");
    }
    if (!form.sopDate) {
      newErrors.sopDate = "SOP Date is required.";
      showToast("SOP date is required", "warn");
    }
    if (!form.equipment.trim()) {
      newErrors.equipment = "Equipment is required.";
      showToast("Equipment is required", "warn");
    }
    if (!form.controls.trim()) {
      newErrors.controls = "Controls are required.";
      showToast("Controls are required", "warn");
    }
    if (!form.chemicalAndUtilities.trim()) {
      newErrors.chemicalAndUtilities = "Chemicals and utilities are required.";
      showToast("Chemicals and utilities are required", "warn");
    }
    if (!form.temperature.trim()) {
      newErrors.temperature = "Temperature is required.";
      showToast("Temperature is required", "warn");
    }
    if (!form.pressure.trim()) {
      newErrors.pressure = "Pressure is required.";
      showToast("Pressure is required", "warn");
    }
    if (!form.quantityFlowRate.trim()) {
      newErrors.quantityFlowRate = "Quantity is required.";
      showToast("Quantity is required", "warn");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      setErrors({});
      const currentRegId = registrationId || hazopData?.id;

      const payload = [
        {
          date: formatDateToBackend(form.date),
          designIntent: form.designIntent,
          pIdRevision: form.pIdRevision,
          sopNo: form.sopNo,
          sopDate: formatDateToBackend(form.sopDate),
          equipment: form.equipment,
          controls: form.controls,
          chemicalAndUtilities: form.chemicalAndUtilities,
          temprature: form.temperature,
          pressure: form.pressure,
          quantityFlowRate: form.quantityFlowRate,
        },
      ];

      await axios.post(
        `http://${strings.localhost}/api/hazopNode/saveNodes/${currentRegId}`,
        payload
      );

      if (onSave) {
        onSave();
      }
      navigate(-1);
      showToast("Hazop node created successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save Hazop node", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable Toolbar Component ---
  const FormatButtons = ({ fieldName }) => (
    <div style={{ display: 'inline-flex', gap: '5px', marginLeft: '10px' }}>
      <button
        type="button"
        onClick={() => formatSelection(fieldName, 'sub')}
        className="fmt-btn"
        title="Subscript (Select text first)"
        style={{
          cursor: 'pointer',
          padding: '2px 6px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '3px',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaSubscript />
      </button>
      <button
        type="button"
        onClick={() => formatSelection(fieldName, 'sup')}
        className="fmt-btn"
        title="Superscript (Select text first)"
        style={{
          cursor: 'pointer',
          padding: '2px 6px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '3px',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaSuperscript />
      </button>
    </div>
  );

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Create Node</h1>
      </div>

      <div>
        <div>
          <div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <span className="required-marker">* </span>Design Intent
                {/* REMOVED FormatButtons from here */}
              </label>
              <textarea
                id="designIntent"
                name="designIntent"
                value={form.designIntent}
                rows={4}
                onChange={handleChange}
                className="textareaFont"
                disabled={loading}
              />
            </div>

            {/* Node meta */}
            <div className="input-row">
              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>Node Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>P&ID No. & Revision
                </label>
                <input
                  type="text"
                  name="pIdRevision"
                  value={form.pIdRevision}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>SOP Number
                </label>
                <input
                  type="text"
                  name="sopNo"
                  value={form.sopNo}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>SOP Date
                </label>
                <input
                  type="date"
                  name="sopDate"
                  value={form.sopDate}
                  onChange={handleChange}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* SOP */}
            <div className="input-row">
              <div className="form-group">
                {/* 1. TEMPERATURE: KEPT BUTTONS */}
                <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="required-marker">* </span>Temperature
                    <FormatButtons fieldName="temperature" />
                  </div>
                  <small className={`char-count ${form.temperature.length >= 1000 ? "limit-reached" : ""}`}>
                    {form.temperature.length}/1000
                  </small>
                </label>
                <input
                  id="temperature"
                  type="text"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                {/* 2. PRESSURE: KEPT BUTTONS */}
                <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="required-marker">* </span>Pressure, barg
                    <FormatButtons fieldName="pressure" />
                  </div>
                  <small className={`char-count ${form.pressure.length >= 1000 ? "limit-reached" : ""}`}>
                    {form.pressure.length}/1000
                  </small>
                </label>
                <input
                  id="pressure"
                  type="text"
                  name="pressure"
                  value={form.pressure}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                {/* 3. QUANTITY: KEPT BUTTONS (Recommended for m3, etc) */}
                <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="required-marker">* </span>Quantity
                    <FormatButtons fieldName="quantityFlowRate" />
                  </div>
                  <small className={`char-count ${form.quantityFlowRate.length >= 1000 ? "limit-reached" : ""}`}>
                    {form.quantityFlowRate.length}/1000
                  </small>
                </label>
                <input
                  id="quantityFlowRate"
                  type="text"
                  name="quantityFlowRate"
                  value={form.quantityFlowRate}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>
            </div>
          </div>

          {/* Equipment / controls */}
          <div className="input-row">
            <div className="form-group">
              <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="required-marker">* </span>Equipment
                  {/* REMOVED FormatButtons from here */}
                </div>
                <small className={`char-count ${form.equipment.length >= 2000 ? "limit-reached" : ""}`}>
                  {form.equipment.length}/2000
                </small>
              </label>
              <textarea
                id="equipment"
                type="text"
                name="equipment"
                value={form.equipment}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className="textareaFont"
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="required-marker">* </span>Controls
                  {/* REMOVED FormatButtons from here */}
                </div>
                <small className={`char-count ${form.controls.length >= 2000 ? "limit-reached" : ""}`}>
                  {form.controls.length}/2000
                </small>
              </label>
              <textarea
                id="controls"
                type="text"
                name="controls"
                value={form.controls}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                maxLength={2000}
                className="textareaFont"
              />
            </div>

            {/* Chemicals */}
            <div className="form-group full-width">
              {/* 4. CHEMICALS: KEPT BUTTONS (Recommended for Formulas like H2O) */}
              <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="required-marker">* </span>Chemicals and utilities
                  <FormatButtons fieldName="chemicalAndUtilities" />
                </div>
                <small className={`char-count ${form.chemicalAndUtilities.length >= 1000 ? "limit-reached" : ""}`}>
                  {form.chemicalAndUtilities.length}/1000
                </small>
              </label>
              <textarea
                id="chemicalAndUtilities"
                type="text"
                name="chemicalAndUtilities"
                value={form.chemicalAndUtilities}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                maxLength={1000}
                className="textareaFont"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="center-controls">
        <button
          type="button"
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Node"}
        </button>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default NodePopup;