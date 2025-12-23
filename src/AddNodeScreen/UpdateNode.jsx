import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Node.css";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaSubscript, FaSuperscript } from "react-icons/fa"; // 1. Added Import

const UpdateNode = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const nodeId = state?.nodeId;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    creationDate: "",
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

  // --- 2. Mappings for Subscript and Superscript ---
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'x': 'ₓ', 'y': 'ᵧ'
  };

  const supMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ'
  };

  // --- 3. Helper to Format Selected Text ---
  const formatSelection = (fieldName, type) => {
    const input = document.getElementById(fieldName); // IDs are crucial here
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

  useEffect(() => {
    if (!nodeId) return;

    axios
      .get(`http://${strings.localhost}/api/hazopNode/${nodeId}`)
      .then((res) => {
        const data = res.data;

        setForm({
          creationDate: data.creationDate || "",
          designIntent: data.designIntent || "",
          pIdRevision: data.pIdRevision || "",
          sopNo: data.sopNo || "",
          sopDate: data.sopDate || "",
          equipment: data.equipment || "",
          controls: data.controls || "",
          chemicalAndUtilities: data.chemicalAndUtilities || "",
          temperature: data.temprature || "", // Note backend spelling
          pressure: data.pressure || "",
          quantityFlowRate: data.quantityFlowRate || "",
        });
      })
      .catch(() => showToast("Failed to load node data", "error"));
  }, [nodeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.creationDate) showToast("Date is required", "warn");
    if (!form.designIntent.trim()) showToast("Design Intent is required", "warn");
    if (!form.pIdRevision) showToast("P&ID No. is required", "warn");
    if (!form.sopNo.trim()) showToast("SOP number is required", "warn");
    if (!form.sopDate) showToast("SOP date is required", "warn");
    if (!form.equipment.trim()) showToast("Equipment is required", "warn");
    if (!form.controls.trim()) showToast("Controls are required", "warn");
    if (!form.chemicalAndUtilities.trim())
      showToast("Chemicals and utilities are required", "warn");
    if (!form.temperature.trim()) showToast("Temperature is required", "warn");
    if (!form.pressure.trim()) showToast("Pressure is required", "warn");
    if (!form.quantityFlowRate.trim()) showToast("Quantity is required", "warn");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        creationDate: formatDateToBackend(form.creationDate),
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
      };

      await axios.put(
        `http://${strings.localhost}/api/hazopNode/update/${nodeId}`,
        payload
      );

      showToast("Node updated successfully!", "success");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showToast("Failed to update node", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Reusable Toolbar Component ---
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
        <h1>Update Node</h1>
      </div>

      <div>
        <div>
          <div>
            <div className="form-group">
              <label>
                <span className="required-marker">* </span>Design Intent
              </label>
              <textarea
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
                  name="creationDate"
                  value={form.creationDate}
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
              {/* 5. TEMPERATURE: Buttons Added */}
              <div className="form-group">
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
                  id="temperature" // Added ID
                  type="text"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              {/* 6. PRESSURE: Buttons Added */}
              <div className="form-group">
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
                  id="pressure" // Added ID
                  type="text"
                  name="pressure"
                  value={form.pressure}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              {/* 7. QUANTITY: Buttons Added */}
              <div className="form-group">
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
                  id="quantityFlowRate" // Added ID
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
              <label className="table-header">
                <div><span className="required-marker">* </span>Equipment</div>
                <small
                  className={`char-count ${form.equipment.length >= 2000 ? "limit-reached" : ""
                    }`}
                >
                  {form.equipment.length}/2000
                </small>
              </label>
              <textarea
                type="text"
                name="equipment"
                value={form.equipment}
                onChange={handleChange}
                disabled={loading}
                rows={5}
                className="textareaFont"
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="table-header">
                <div><span className="required-marker">* </span>Controls</div>
                <small
                  className={`char-count ${form.controls.length >= 2000 ? "limit-reached" : ""
                    }`}
                >
                  {form.controls.length}/2000
                </small>
              </label>
              <textarea
                type="text"
                name="controls"
                value={form.controls}
                onChange={handleChange}
                disabled={loading}
                rows={5}
                maxLength={2000}
                className="textareaFont"
              />
            </div>

            {/* Chemicals */}
            {/* 8. CHEMICALS: Buttons Added */}
            <div className="form-group full-width">
              <label className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="required-marker">* </span>Chemicals and utilities
                  <FormatButtons fieldName="chemicalAndUtilities" />
                </div>
                <small
                  className={`char-count ${form.chemicalAndUtilities.length >= 1000
                    ? "limit-reached"
                    : ""
                    }`}
                >
                  {form.chemicalAndUtilities.length}/1000
                </small>
              </label>
              <textarea
                id="chemicalAndUtilities" // Added ID
                type="text"
                name="chemicalAndUtilities"
                value={form.chemicalAndUtilities}
                onChange={handleChange}
                disabled={loading}
                rows={5}
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
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Node"}
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

export default UpdateNode;