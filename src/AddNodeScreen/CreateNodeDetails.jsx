import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import "./Node.css";
import Recommendations from "./Recommendations";
import { strings } from "../string";
import { useLocation, useNavigate } from "react-router-dom";

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

const CreateNodeDetails = () => {
  const [form, setForm] = useState(initialState);
  const [rows, setRows] = useState(15);
  const [smallRows, setSmallRows] = useState(7);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [tempRecommendations, setTempRecommendations] = useState([]);
  const additionalControlRef = React.useRef(null);
  const [node, setNode] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const nodeID = location.state?.nodeID;
  const nodeNumber = Number(node?.nodeNumber);

  useEffect(() => {
    const fetchNode = async () => {
      try {
        const response = await fetch(
          `http://${strings.localhost}/api/hazopNode/${nodeID}`
        );

        if (response.ok) {
          const data = await response.json();
          setNode(data);
        }
      } catch (err) {
        console.error("Error fetching node:", err);
      }
    };

    if (nodeID) fetchNode();
  }, [nodeID]);

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
        setRows(Math.min(20, Math.max(15, lineCount)));
      }

      if (name === "additionalControl" || name === "existineControl") {
        const lineCount = value.split("\n").length;
        setSmallRows(Math.min(10, Math.max(7, lineCount)));
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

  const validate = () => {
    // Required fields
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

    // Additional controls required when riskRating ≥ 12
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

  const handleComplete = () => {
    navigate("/NodeDetails", {
      state: {
        id: node?.id || nodeID || detail?.nodeId,
      },
    });
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

    try {
      setLoading(true);
      // Save node detail first
      const nodeDetailResponse = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${nodeID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([form]),
        }
      );

      if (nodeDetailResponse.ok) {
        const nodeDetailResult = await nodeDetailResponse.json();
        const savedDetail = Array.isArray(nodeDetailResult)
          ? nodeDetailResult[0]
          : nodeDetailResult;

        const nodeDetailId = savedDetail.id;

        if (tempRecommendations.length > 0 && nodeDetailId) {
          await fetch(
            `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}/${nodeDetailId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                tempRecommendations.map((item) => ({
                  recommendation: item.recommendation,
                  remarkbyManagement: item.remarkbyManagement,
                }))
              ),
            }
          );
        }

        showToast("Details saved successfully!", "success");
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

  const handleSaveAndNext = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await handleSubmit(e); // save the data

    setForm(initialState); // empty form
    setTempRecommendations([]);

    window.scrollTo(0, 0);
  };

  const isAdditionalRequired = () => {
    const riskRating = parseInt(form.riskRating, 10) || 0;
    return riskRating >= 12;
  };

  const openRecommendations = () => {
    setShowRecommendations(true);
  };

  const saveRecommendations = (recs) => {
    setTempRecommendations(
      recs.map((r) => ({
        recommendation: r.recommendation,
        remarkbyManagement: r.remarkbyManagement,
      }))
    );

    const bulletText = recs.map((r) => `• ${r.recommendation ?? r}`).join("\n");

    setForm((prev) => ({ ...prev, additionalControl: bulletText }));

    setShowRecommendations(false);
  };

  const renderScaleSelect = (name, value, style) => (
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className="form-group"
      style={style}
    >
      <option value="">Select</option>
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );

  const root = document.documentElement;
  const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
  const tolerable = getComputedStyle(root)
    .getPropertyValue("--tolerable")
    .trim();
  const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
  const substantial = getComputedStyle(root)
    .getPropertyValue("--substantial")
    .trim();
  const intolerable = getComputedStyle(root)
    .getPropertyValue("--intolerable")
    .trim();

  const getBorderColor = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return trivial;
    if ([6, 8, 9, 10].includes(r)) return tolerable;
    if ([12, 15].includes(r)) return moderate;
    if ([16, 18].includes(r)) return substantial;
    if ([20, 25].includes(r)) return intolerable;

    return "#ccc";
  };

  // CSS class based on risk
  const getRiskClass = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "risk-trivial";
    if ([6, 8, 9, 10].includes(r)) return "risk-tolerable";
    if ([12, 15].includes(r)) return "risk-moderate";
    if ([16, 18].includes(r)) return "risk-substantial";
    if ([20, 25].includes(r)) return "risk-intolerable";

    return "risk-default";
  };

  const getRiskLevelText = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "Trivial";
    if ([6, 8, 9, 10].includes(r)) return "Tolerable";
    if ([12, 15].includes(r)) return "Moderate";
    if ([16, 18].includes(r)) return "Substantial";
    if ([20, 25].includes(r)) return "Intolerable";

    return "";
  };

  const getRiskTextClass = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "risk-badge risk-trivial";
    if ([6, 8, 9, 10].includes(r)) return "risk-badge risk-tolerable";
    if ([12, 15].includes(r)) return "risk-badge risk-moderate";
    if ([16, 18].includes(r)) return "risk-badge risk-substantial";
    if ([20, 25].includes(r)) return "risk-badge risk-intolerable";

    return "risk-default";
  };

  const addBulletPoint = () => {
    const bullet = "• ";

    const newValue = !form.additionalControl.trim()
      ? bullet
      : form.additionalControl + "\n" + bullet;

    handleChange({
      target: {
        name: "additionalControl",
        value: newValue,
      },
    });
    setTimeout(() => {
      if (additionalControlRef.current) {
        additionalControlRef.current.focus();
        additionalControlRef.current.selectionStart =
          additionalControlRef.current.value.length;
        additionalControlRef.current.selectionEnd =
          additionalControlRef.current.value.length;
      }
    }, 0);
  };

  useEffect(() => {
    if (!form.additionalControl.trim()) {
      setForm((prev) => ({
        ...prev,
        additionalControl: "• ",
      }));
    }
  }, []);

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Add Discussion</h1>
      </div>

      <div>
        <div className="hazop-info">
          <div className="input-row">
            <div>
              <strong>Node No.: </strong> {node?.nodeNumber}
            </div>
            <div>
              <strong>Registration Date: </strong>
              {node?.registrationDate && formatDate(node.registrationDate)}
            </div>
            <div>
              <strong>Completion Status: </strong>
              <span
                className={
                  node?.completionStatus === true
                    ? "status-completed"
                    : "status-pending"
                }
              >
                {node?.completionStatus ? "Completed" : "Ongoing"}
              </span>
            </div>
          </div>

          <div>
            <strong>Design Intent:</strong> {node?.designIntent}
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="form-group">
                <label>
                  {" "}
                  <span className="required-marker">*</span>General Parameter
                </label>
                <input
                  type="text"
                  name="generalParameter"
                  value={form.generalParameter}
                  onChange={handleChange}
                  maxLength={1000}
                />
                <small
                  className={`char-count ${
                    form.generalParameter.length >= 1000 ? "limit-reached" : ""
                  }`}
                >
                  {form.generalParameter.length}/1000
                </small>
              </div>
              <div className="form-group">
                <label>
                  {" "}
                  <span className="required-marker">*</span>Specific Parameter
                </label>
                <input
                  type="text"
                  name="specificParameter"
                  value={form.specificParameter}
                  onChange={handleChange}
                  maxLength={1000}
                />
                <small
                  className={`char-count ${
                    form.specificParameter.length >= 1000 ? "limit-reached" : ""
                  }`}
                >
                  {form.specificParameter.length}/1000
                </small>
              </div>
              <div className="form-group">
                <label>
                  {" "}
                  <span className="required-marker">*</span>Guide Word
                </label>
                <input
                  type="text"
                  name="guidWord"
                  value={form.guidWord}
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

            <div className="input-row">
              <div className="form-group">
                <label>
                  {" "}
                  <span className="required-marker">*</span>Deviation
                </label>
                <textarea
                  name="deviation"
                  rows={rows}
                  value={form.deviation}
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
              <div className="form-group">
                <label>
                  {" "}
                  <span className="required-marker">*</span>Causes
                </label>
                <textarea
                  name="causes"
                  rows={rows}
                  value={form.causes}
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
                <label>
                  {" "}
                  <span className="required-marker">*</span>Consequences
                </label>
                <textarea
                  name="consequences"
                  rows={rows}
                  value={form.consequences}
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

              <div>
                <div className="form-group existing-control">
                  <label>
                    {" "}
                    <span className="required-marker">*</span>Existing Control
                  </label>
                  <textarea
                    name="existineControl"
                    rows={smallRows}
                    value={form.existineControl}
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
                <div className="metric-row">
                  <div className="form-group">
                    <label>
                      {" "}
                      <span className="required-marker">*</span>Probability
                    </label>
                    {renderScaleSelect(
                      "existineProbability",
                      form.existineProbability,
                      {
                        borderColor: getBorderColor(form.riskRating),
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderLeft: `5px solid ${getBorderColor(
                          form.riskRating
                        )}`,
                      }
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      {" "}
                      <span className="required-marker">*</span>Severity
                    </label>
                    {renderScaleSelect(
                      "existingSeverity",
                      form.existingSeverity,
                      {
                        borderColor: getBorderColor(form.riskRating),
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderLeft: `5px solid ${getBorderColor(
                          form.riskRating
                        )}`,
                      }
                    )}
                  </div>
                </div>
                <div className="form-group metric-single">
                  <label>
                    {" "}
                    <span className="required-marker">*</span>Risk Rating
                  </label>
                  <input
                    type="text"
                    name="riskRating"
                    value={form.riskRating}
                    onChange={handleChange}
                    readOnly
                    className={`readonly ${getRiskClass(form.riskRating)}`}
                    style={{
                      borderColor: getBorderColor(form.riskRating),
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderLeft: `5px solid ${getBorderColor(
                        form.riskRating
                      )}`,
                    }}
                  />
                </div>
                <small
                  className={`risk-text ${getRiskTextClass(
                    form.riskRating
                  )} center-controls`}
                >
                  {getRiskLevelText(form.riskRating)}
                </small>
              </div>

              <div>
                <div className="form-group existing-control">
                  <div className="label-row">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">* </span>
                      )}
                      Additional Control
                    </label>

                    <div onClick={addBulletPoint} style={{ cursor: "pointer" }}>
                      <FaPlus />
                    </div>
                  </div>

                  <textarea
                    name="additionalControl"
                    rows={smallRows}
                    value={form.additionalControl}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                    ref={additionalControlRef}
                  />
                  <small
                    className={`char-count ${
                      form.additionalControl.length >= 5000
                        ? "limit-reached"
                        : ""
                    }`}
                  >
                    {form.additionalControl.length}/5000
                  </small>
                </div>
                <div className="metric-row">
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">* </span>
                      )}
                      Probability
                    </label>
                    {renderScaleSelect(
                      "additionalProbability",
                      form.additionalProbability,
                      {
                        borderColor: getBorderColor(form.additionalRiskRating),
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderLeft: `5px solid ${getBorderColor(
                          form.additionalRiskRating
                        )}`,
                      }
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">* </span>
                      )}
                      Severity
                    </label>
                    {renderScaleSelect(
                      "additionalSeverity",
                      form.additionalSeverity,
                      {
                        borderColor: getBorderColor(form.additionalRiskRating),
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderLeft: `5px solid ${getBorderColor(
                          form.additionalRiskRating
                        )}`,
                      }
                    )}
                  </div>
                </div>
                <div className="form-group metric-single">
                  <label>
                    {isAdditionalRequired() && (
                      <span className="required-marker">* </span>
                    )}
                    Additional Risk Rating
                  </label>
                  <input
                    type="text"
                    name="additionalRiskRating"
                    value={form.additionalRiskRating}
                    onChange={handleChange}
                    readOnly
                    className={`readonly ${getRiskClass(
                      form.additionalRiskRating
                    )}`}
                    style={{
                      borderColor: getBorderColor(form.additionalRiskRating),
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderLeft: `5px solid ${getBorderColor(
                        form.additionalRiskRating
                      )}`,
                    }}
                  />
                </div>
                <small
                  className={`risk-text ${getRiskTextClass(
                    form.additionalRiskRating
                  )} center-controls`}
                >
                  {getRiskLevelText(form.additionalRiskRating)}
                </small>
              </div>
            </div>

            <div className="center-controls">
              <button
                type="button"
                className="save-btn"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? "Loading..." : "Complete"}
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={handleSaveAndNext}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            </div>
          </form>
        </div>
        {/* {showRecommendations && (
            <Recommendations
              onClose={() => setShowRecommendations(false)}
              onSave={saveRecommendations}
              initialRecommendations={[]}
              nodeID={nodeID}
            />
          )} */}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default CreateNodeDetails;
