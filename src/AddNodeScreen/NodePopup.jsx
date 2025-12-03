import React, { useState } from "react";
import axios from "axios";
import "./Node.css";
import { FaTimes } from "react-icons/fa";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const NodePopup = ({ onClose, onSaved, hazopData }) => {
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
      newErrors.nodeNumber = "Node number is required.";
      showToast("Node number is required", "warn");
    }
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
    if (!form.title.trim()) {
      newErrors.title = "Node title is required.";
      showToast("Node title is required", "warn");
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
      setLoading(true);
      setErrors({});

      const registrationId = hazopData.id;
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
        `http://${strings.localhost}/api/hazopNode/saveNodes/${registrationId}`,
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
                    <span className="required-marker">* </span>Node Number
                  </label>
                  <input
                    type="number"
                    name="nodeNumber"
                    value={form.nodeNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>Node Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>P&ID No. &
                    Revision
                  </label>
                  <input
                    type="number"
                    name="pIdRevision"
                    value={form.pIdRevision}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group ">
                  <label>
                    <span className="required-marker">* </span>Node Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Design / P&ID */}
              <div className="form-group">
                <label>
                  <span className="required-marker">* </span>Design Intent
                </label>
                <textarea
                  name="designIntent"
                  value={form.designIntent}
                  rows={3}
                  onChange={handleChange}
                />
              </div>

              {/* SOP */}
              <div className="input-row">
                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>SOP Number
                  </label>
                  <input
                    type="text"
                    name="sopNo"
                    value={form.sopNo}
                    onChange={handleChange}
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
                    max={new Date().toISOString().split("T")[0]}
                  />
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>Temperature
                  </label>
                  <input
                    type="text"
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>Pressure, barg
                  </label>
                  <input
                    type="text"
                    name="pressure"
                    value={form.pressure}
                    onChange={handleChange}
                  />
                </div>
                </div>
              </div>

              {/* Equipment / controls */}
              <div className="input-row">
                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>Equipment
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    value={form.equipment}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="required-marker">* </span>Controls
                  </label>
                  <input
                    type="text"
                    name="controls"
                    value={form.controls}
                    onChange={handleChange}
                  />
                </div>

                {/* Chemicals */}
                <div className="form-group full-width">
                  <label>
                    <span className="required-marker">* </span>Chemicals and
                    utilities
                  </label>
                  <input
                    type="text"
                    name="chemicalAndUtilities"
                    value={form.chemicalAndUtilities}
                    rows={2}
                    onChange={handleChange}
                  />
                </div>

                {/* Process conditions */}
                <div className="input-row">
                  <div className="form-group">
                    <label>
                      <span className="required-marker">* </span>Quantity
                    </label>
                    <input
                      type="text"
                      name="quantityFlowRate"
                      value={form.quantityFlowRate}
                      onChange={handleChange}
                    />
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
