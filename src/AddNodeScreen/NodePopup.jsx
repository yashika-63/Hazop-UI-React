import React, { useState } from "react";
import axios from "axios";
import "./Node.css";
import { FaTimes } from "react-icons/fa";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";

const NodePopup = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    nodeNumber: "",
    date: "",
    designIntent: "",
    pIdRevision: "",
    title: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nodeNumber) {
      newErrors.nodeNumber = "Node Number is required.";
    }
    if (!form.date) {
      newErrors.date = "Date is required.";
    }
    if (!form.designIntent.trim()) {
      newErrors.designIntent = "Design Intent is required.";
    }
    if (!form.pIdRevision) {
      newErrors.pIdRevision = "P&ID No. & Revision is required.";
    }
    if (!form.title.trim()) {
      newErrors.title = "Node Title is required.";
    }
    if (!form.sopNo.trim()) {
      newErrors.sopNo = "SOP Number is required.";
    }
    if (!form.sopDate) {
      newErrors.sopDate = "SOP Date is required.";
    }
    if (!form.equipment.trim()) {
      newErrors.equipment = "Equipment is required.";
    }
    if (!form.controls.trim()) {
      newErrors.controls = "Controls are required.";
    }
    if (!form.chemicalAndUtilities.trim()) {
      newErrors.chemicalAndUtilities = "Chemicals and utilities are required.";
    }
    if (!form.temperature.trim()) {
      newErrors.temperature = "Temperature is required.";
    }
    if (!form.pressure.trim()) {
      newErrors.pressure = "Pressure is required.";
    }
    if (!form.quantityFlowRate.trim()) {
      newErrors.quantityFlowRate = "Quantity is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      setLoading(true);
      setErrors({});

      const payload = [
        {
          nodeNumber: form.nodeNumber,
          date: formatDateToBackend(form.date),
          designIntent: form.designIntent,
          pIdRevision: form.pIdRevision,
          title: form.title,
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

      const res = await axios.post(
        "http://localhost:5559/api/hazopNode/saveNodes/1",
        payload
      );

      if (onSaved) {
        onSaved(res.data || payload);
      }

      showToast("Hazop note created successfully!", "success");
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save Hazop note", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-header">Create Hazop Node</h2>

          <div className="popup-body">
            <div>
              {/* Node meta */}
              <div className="input-row">
                <div className="form-group">
                  <label>
                    <label className="required-marker">*</label>Node Number
                  </label>
                  <input
                    type="number"
                    name="nodeNumber"
                    value={form.nodeNumber}
                    onChange={handleChange}
                  />
                  {errors.nodeNumber && (
                    <p className="error">{errors.nodeNumber}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>Node Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && <p className="error">{errors.date}</p>}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>P&ID No. &
                    Revision
                  </label>
                  <input
                    type="number"
                    name="pIdRevision"
                    value={form.pIdRevision}
                    onChange={handleChange}
                  />
                  {errors.pIdRevision && (
                    <p className="error">{errors.pIdRevision}</p>
                  )}
                </div>

                <div className="form-group ">
                  <label>
                    <label className="required-marker">* </label>Node Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                  />
                  {errors.title && <p className="error">{errors.title}</p>}
                </div>
              </div>

              {/* Design / P&ID */}
              <div className="form-group">
                <label>
                  <label className="required-marker">* </label>Design Intent
                </label>
                <textarea
                  name="designIntent"
                  value={form.designIntent}
                  rows={3}
                  onChange={handleChange}
                />
                {errors.designIntent && (
                  <p className="error">{errors.designIntent}</p>
                )}
              </div>

              {/* SOP */}
              <div className="input-row">
                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>SOP Number
                  </label>
                  <input
                    type="text"
                    name="sopNo"
                    value={form.sopNo}
                    onChange={handleChange}
                  />
                  {errors.sopNo && <p className="error">{errors.sopNo}</p>}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>SOP Date
                  </label>
                  <input
                    type="date"
                    name="sopDate"
                    value={form.sopDate}
                    onChange={handleChange}
                                      max={new Date().toISOString().split("T")[0]}
/>
                  {errors.sopDate && <p className="error">{errors.sopDate}</p>}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>Temperature
                  </label>
                  <input
                    type="text"
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                  />
                  {errors.temperature && (
                    <p className="error">{errors.temperature}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>Pressure, barg
                  </label>
                  <input
                    type="text"
                    name="pressure"
                    value={form.pressure}
                    onChange={handleChange}
                  />
                                {errors.pressure && <p className="error">{errors.pressure}</p>}
</div>
              </div>

              {/* Equipment / controls */}
              <div className="input-row">
                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>Equipment
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    value={form.equipment}
                    onChange={handleChange}
                  />
                  {errors.equipment && (
                    <p className="error">{errors.equipment}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <label className="required-marker">* </label>Controls
                  </label>
                  <input
                    type="text"
                    name="controls"
                    value={form.controls}
                    onChange={handleChange}
                  />
                  {errors.controls && (
                    <p className="error">{errors.controls}</p>
                  )}
                </div>

                {/* Chemicals */}
                <div className="form-group full-width">
                  <label>
                    <label className="required-marker">* </label>Chemicals and
                    utilities
                  </label>
                  <input
                    type="text"
                    name="chemicalAndUtilities"
                    value={form.chemicalAndUtilities}
                    rows={2}
                    onChange={handleChange}
                  />
                  {errors.chemicalAndUtilities && (
                    <p className="error">{errors.chemicalAndUtilities}</p>
                  )}
                </div>

                {/* Process conditions */}
                <div className="input-row">
                  <div className="form-group">
                    <label>
                      <label className="required-marker">* </label>Quantity
                    </label>
                    <input
                      type="text"
                      name="quantityFlowRate"
                      value={form.quantityFlowRate}
                      onChange={handleChange}
                    />
                    {errors.quantityFlowRate && (
                      <p className="error">{errors.quantityFlowRate}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="center-controls">
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Node"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePopup;
