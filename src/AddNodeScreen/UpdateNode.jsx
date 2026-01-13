import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Node.css";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaSubscript, FaSuperscript } from "react-icons/fa";

const UpdateNode = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const nodeId = state?.nodeId;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 1. Track Active Field for Global Formatting ---
  const [activeField, setActiveField] = useState(null);

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

  // --- 2. Enhanced Mappings (Handles Normal -> Sub/Sup AND Sub <-> Sup) ---
  const subMap = {
    // Normal to Sub
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'x': 'ₓ', 'y': 'ᵧ',
    // Superscript to Sub (Conversion)
    '⁰': '₀', '¹': '₁', '²': '₂', '³': '₃', '⁴': '₄', '⁵': '₅', '⁶': '₆', '⁷': '₇', '⁸': '₈', '⁹': '₉',
    '⁺': '₊', '⁻': '₋', '⁼': '₌', '⁽': '₍', '⁾': '₎', 'ˣ': 'ₓ', 'ʸ': 'ᵧ', 'ⁿ': 'ₙ'
  };

  const supMap = {
    // Normal to Sup
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ',
    // Subscript to Sup (Conversion)
    '₀': '⁰', '₁': '¹', '₂': '²', '₃': '³', '₄': '⁴', '₅': '⁵', '₆': '⁶', '₇': '⁷', '₈': '⁸', '₉': '⁹',
    '₊': '⁺', '₋': '⁻', '₌': '⁼', '₍': '⁽', '₎': '⁾', 'ₓ': 'ˣ', 'ᵧ': 'ʸ'
  };

  // --- 3. Handle Focus ---
  const handleFocus = (e) => {
    setActiveField(e.target.id);
  };

  // --- 4. Global Formatter Functions ---
  const applyGlobalFormat = (type) => {
    if (!activeField) {
      showToast("Please click inside a text field first.", "info");
      return;
    }
    formatSelection(activeField, type);
  };

  const formatSelection = (fieldName, type) => {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentText = form[fieldName] || "";

    if (start === end) {
      showToast("Please highlight the text/numbers to format.", "info");
      input.focus();
      return;
    }

    const selectedText = currentText.substring(start, end);
    const map = type === 'sub' ? subMap : supMap;

    let convertedText = "";
    for (let char of selectedText) {
      // If char is in map, use map. If not, check if it's already in the target format? 
      // Actually, standard logic: try map, if missing keep char.
      convertedText += map[char] || char;
    }

    const newText = currentText.substring(0, start) + convertedText + currentText.substring(end);

    setForm(prev => ({ ...prev, [fieldName]: newText }));

    // Restore cursor and focus
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + convertedText.length, start + convertedText.length);
    }, 0);
  };

  useEffect(() => {
    if (!nodeId) return;

    axios
      .get(`${strings.localhost}/api/hazopNode/${nodeId}`)
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
        `${strings.localhost}/api/hazopNode/update/${nodeId}`,
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

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Update Node</h1>
      </div>

      {/* --- Sticky Toolbar for Formatting --- */}
      <div
        className="global-toolbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="fmt-btn-container" style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => applyGlobalFormat("sub")}
            className={`fmt-btn ${activeField ? "active-fmt" : ""}`}
            title="Subscript"
            style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FaSubscript /> Subscript
          </button>
          <button
            type="button"
            onClick={() => applyGlobalFormat("sup")}
            className={`fmt-btn ${activeField ? "active-fmt" : ""}`}
            title="Superscript"
            style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FaSuperscript /> Superscript
          </button>
        </div>
      </div>

      <div>
        <div>
          <div>
            <div className="form-group">
              <label>
                <span className="required-marker">* </span>Design Intent
              </label>
              <textarea
                id="designIntent"
                name="designIntent"
                value={form.designIntent}
                rows={4}
                onChange={handleChange}
                onFocus={handleFocus} // Track Focus
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
                  id="creationDate"
                  type="date"
                  name="creationDate"
                  value={form.creationDate}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>P&ID No. & Revision
                </label>
                <input
                  id="pIdRevision"
                  type="text"
                  name="pIdRevision"
                  value={form.pIdRevision}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>SOP Number
                </label>
                <input
                  id="sopNo"
                  type="text"
                  name="sopNo"
                  value={form.sopNo}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>SOP Date
                </label>
                <input
                  id="sopDate"
                  type="date"
                  name="sopDate"
                  value={form.sopDate}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* SOP */}
            <div className="input-row">
              <div className="form-group">
                <label className="header-label-row">
                  <div>
                    <span className="required-marker">* </span>Temperature
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
                  onFocus={handleFocus} // Track Focus
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="header-label-row">
                  <div>
                    <span className="required-marker">* </span>Pressure, barg
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
                  onFocus={handleFocus} // Track Focus
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="header-label-row">
                  <div>
                    <span className="required-marker">* </span>Quantity
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
                  onFocus={handleFocus} // Track Focus
                  disabled={loading}
                  maxLength={1000}
                />
              </div>
            </div>
          </div>

          {/* Equipment / controls */}
          <div className="input-row">
            <div className="form-group">
              <label className="header-label-row">
                <div><span className="required-marker">* </span>Equipment</div>
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
                onFocus={handleFocus} // Track Focus
                disabled={loading}
                rows={5}
                className="textareaFont"
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="header-label-row">
                <div><span className="required-marker">* </span>Controls</div>
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
                onFocus={handleFocus} // Track Focus
                disabled={loading}
                rows={5}
                maxLength={2000}
                className="textareaFont"
              />
            </div>

            {/* Chemicals */}
            <div className="form-group full-width">
              <label className="header-label-row">
                <div>
                  <span className="required-marker">* </span>Chemicals and utilities
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
                onFocus={handleFocus} // Track Focus
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