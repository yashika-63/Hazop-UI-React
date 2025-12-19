import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Node.css";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateToBackend, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

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
          temperature: data.temprature || "",
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

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Update Node</h1>
      </div>

      <div>
        <div className="popup-body">
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

              {/* <div className="form-group ">
                  <label>
                    <span className="required-marker">* </span>Node Title
                  </label>
                  <input
                    type="text"
                    name="hazopTitle"
                    value={form.hazopTitle}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div> */}
            </div>

            {/* SOP */}
            <div className="input-row">
              <div className="form-group">
                <label className="table-header">
                  <div><span className="required-marker">* </span>Temperature</div>
                <small
                  className={`char-count ${
                    form.temperature.length >= 1000 ? "limit-reached" : ""
                  }`}
                >
                  {form.temperature.length}/1000
                </small>
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="table-header">
                  <div><span className="required-marker">* </span>Pressure, barg</div>
                <small
                  className={`char-count ${
                    form.pressure.length >= 1000 ? "limit-reached" : ""
                  }`}
                >
                  {form.pressure.length}/1000
                </small>
                </label>
                <input
                  type="text"
                  name="pressure"
                  value={form.pressure}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="table-header">
                  <div><span className="required-marker">* </span>Quantity</div>
                <small
                  className={`char-count ${
                    form.quantityFlowRate.length >= 1000 ? "limit-reached" : ""
                  }`}
                >
                  {form.quantityFlowRate.length}/1000
                </small>
                </label>
                <input
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
                className={`char-count ${
                  form.equipment.length >= 2000 ? "limit-reached" : ""
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
                rows={3}
                className="textareaFont"
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="table-header">
                <div><span className="required-marker">* </span>Controls</div>
              <small
                className={`char-count ${
                  form.controls.length >= 2000 ? "limit-reached" : ""
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
                rows={3}
                maxLength={2000}
                className="textareaFont"
              />
            </div>

            {/* Chemicals */}
            <div className="form-group full-width">
              <label className="table-header">
                <div><span className="required-marker">* </span>Chemicals and
                utilities</div>
              <small
                className={`char-count ${
                  form.chemicalAndUtilities.length >= 1000
                    ? "limit-reached"
                    : ""
                }`}
              >
                {form.chemicalAndUtilities.length}/1000
              </small>
              </label>
              <textarea
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
