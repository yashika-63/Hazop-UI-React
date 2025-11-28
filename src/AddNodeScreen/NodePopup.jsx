import React, { useState } from "react";
import "./Node.css";

const NodePopup = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    nodeNumber: "",
    date: "",
    designIntent: "",
    pandID: "",
    title: "",
    sopNo: "",
    sopDate: "",
    equipment: "",
    controls: "",
    chemicals: "",
    temperature: "",
    pressure: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">

        <div className="popup-header">
          <h2>New Node</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="popup-grid">
          {Object.keys(form).map((key) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/([A-Z])/g, " $1")}</label>
              <input
                type="text"
                name={key}
                value={form[key]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <button className="save-popup-btn" onClick={() => onSave(form)}>
          Save Node
        </button>
      </div>
    </div>
  );
};

export default NodePopup;
