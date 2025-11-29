import React, { useState } from "react";
import axios from "axios";
import "./Node.css";
import { FaTimes } from "react-icons/fa";
import { formatDateToBackend } from "../CommonUI/CommonUI";

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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  try {
    setLoading(true);
    setError("");

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
      }
    ];

    const res = await axios.post(
      "http://localhost:5559/api/hazopNode/saveNodes/1",
      payload
    );

    if (onSaved) {
      onSaved(res.data || payload);
    }

    onClose();
  } catch (err) {
    console.error(err);
    setError("Failed to save node. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="popup-overlay">
      <div className="popup-card">
         <div className="form-controls">
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <h1>Create Hazop Node</h1>
      
        <div className="popup-body">
          <div className="">
            {/* Node meta */}
            <div className="input-row">
            <div className="form-group">
              <label>Node Number</label>
              <input
                type="text"
                name="nodeNumber"
                value={form.nodeNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Node Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>P&ID / Revision</label>
              <input
                type="text"
                name="pIdRevision"
                value={form.pIdRevision}
                onChange={handleChange}
              />
            </div>
</div>

            <div className="form-group ">
              <label>Node Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Design / P&ID */}
            <div className="form-group">
              <label>Design Intent</label>
              <textarea
                name="designIntent"
                value={form.designIntent}
                rows={1}
                onChange={handleChange}
              />
            </div>

            
            {/* SOP */}
            <div className="input-row">
            <div className="form-group">
              <label>SOP Number</label>
              <input
                type="text"
                name="sopNo"
                value={form.sopNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>SOP Date</label>
              <input
                type="date"
                name="sopDate"
                value={form.sopDate}
                onChange={handleChange}
              />
            </div>
            </div>

            {/* Equipment / controls */}
            <div className="input-row">
            <div className="form-group">
              <label>Equipment</label>
              <input
                type="text"
                name="equipment"
                value={form.equipment}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Controls / Instrumentation</label>
              <input
                type="text"
                name="controls"
                value={form.controls}
                onChange={handleChange}
              />
            </div>

            {/* Chemicals */}
            <div className="form-group full-width">
              <label>Chemicals / Service</label>
              <input
              type="text"
                name="chemicalAndUtilities"
                value={form.chemicalAndUtilities}
                rows={2}
                onChange={handleChange}
              />
            </div>
</div>

            {/* Process conditions */}
            <div className="input-row">
            <div className="form-group">
              <label>Temperature</label>
              <input
                type="text"
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Pressure</label>
              <input
                type="text"
                name="pressure"
                value={form.pressure}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Quantity / Inventory</label>
              <input
                type="text"
                name="quantityFlowRate"
                value={form.quantityFlowRate}
                onChange={handleChange}
              />
            </div>
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>

        <div className="popup-footer">
          <button
            className="save-popup-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Node"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePopup;
