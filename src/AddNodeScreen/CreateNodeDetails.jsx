import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
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
  const [tempRecommendations, setTempRecommendations] = useState([]);
  const additionalControlRef = React.useRef(null);
  const [node, setNode] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const nodeID = location.state?.nodeID;

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
    setIsSaved(false);
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

       if (name === "additionalControl") {
      const lines = value.split("\n").map((line) => line.replace(/^•\s*/, "").trim()).filter((line) => line !== "");
      const recommendations = lines.map((text) => ({ recommendation: text, remarkbyManagement: "" }));
      setTempRecommendations(recommendations);
    }

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

  useEffect(() => {
    fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`)
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }, [nodeID]);

  const handleNext = () => {
    if (!isSaved) {
      showToast("Please save the form before navigating.", "warn");
      return;
    }

    if (currentIndex + 1 < details.length) {
      setCurrentIndex(currentIndex + 1);
      setForm(details[currentIndex + 1]);
    } else {
      showToast("No next record found.", "info");
    }
  };

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!nodeID) return;
      try {
        setLoading(true);
        const res = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`
        );
        if (!res.ok) throw new Error("Failed to fetch node details");
        const data = await res.json();
        if (data && data.length > 0) {
          setDetails(data);
          setCurrentIndex(0);
          const firstDetail = data[0];
          setForm({
            ...firstDetail,
            additionalControl:
              firstDetail.recommendations
                ?.map((r) => r.recommendation)
                .join("\n") || "• ",
          });
          setTempRecommendations(firstDetail.recommendations || []);
          setCurrentDetailId(firstDetail.id);
          setIsSaved(true);
        }
      } catch (err) {
        console.error("Error fetching node details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [nodeID]);

  const validate = () => {
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

  try {
    setLoading(true);
    const nodeDetailResponse = await fetch(
      `http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${nodeID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([form]),
      }
    );

    if (nodeDetailResponse.ok) {
      setIsSaved(true);
      const nodeDetailResult = await nodeDetailResponse.json();
      const savedDetail = Array.isArray(nodeDetailResult)
        ? nodeDetailResult[0]
        : nodeDetailResult;

      const nodeDetailId = savedDetail.id;
      setCurrentDetailId(nodeDetailId);

      // Extract recommendations from additionalControl textarea
      const cleanedRecommendations = form.additionalControl
        .split("\n")
        .map((line) => line.replace(/^•\s*/, "").trim())
        .filter((line) => line !== "");

      // Prepare recommendations for save/update
      const recommendationsList = cleanedRecommendations.map((text, index) => {
        const existingRec = tempRecommendations[index];
        return {
          id: existingRec?.id,
          recommendation: text,
          remarkbyManagement: existingRec?.remarkbyManagement || "",
        };
      });

      // Send recommendations as an array
      const recommendationsResponse = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}/${nodeDetailId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recommendationsList),
        }
      );

      if (recommendationsResponse.ok) {
        showToast("Details saved successfully!", "success");
      } else {
        showToast("Failed to save recommendations.", "error");
      }
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

  const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="confirm-overlay">
        <div className="confirm-box">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              No
            </button>
            <button type="button" onClick={onConfirm} className="confirm-btn">
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

useEffect(() => {
  const fetchFirstNodeDetail = async () => {
    if (!nodeID) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`
      );
      if (!res.ok) throw new Error("Failed to fetch node details");
      const data = await res.json();

      if (data && data.length > 0) {
        const detail = data[0];
        const recommendationsRes = await fetch(
          `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detail.id}`
        );
        const recommendations = await recommendationsRes.json();

        setForm({
          ...detail,
          additionalControl:
            recommendations.map((r) => r.recommendation).join("\n") || "• ",
        });
        setTempRecommendations(recommendations);
        setCurrentDetailId(detail.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error fetching node details:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchFirstNodeDetail();
}, [nodeID]);

  useEffect(() => {
  const fetchFirstNodeDetail = async () => {
    if (!nodeID) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`
      );
      if (!res.ok) throw new Error("Failed to fetch node details");
      const data = await res.json();

      if (data && data.length > 0) {
        const detail = data[0];
        const recommendationsRes = await fetch(
          `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detail.id}`
        );
        const recommendations = await recommendationsRes.json();

        setForm({
          ...detail,
          additionalControl:
            recommendations.map((r) => r.recommendation).join("\n") || "• ",
        });
        setTempRecommendations(recommendations);
        setCurrentDetailId(detail.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error fetching node details:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchFirstNodeDetail();
}, [nodeID]);

  const handleSaveNextClick = () => {
    if (!validate()) return;
    setShowConfirmation(true);
  };

const handleSaveAndNext = async () => {
  if (!validate()) return;

  try {
    setLoading(true);

    const discussionPayload = {
      generalParameter: form.generalParameter,
      specificParameter: form.specificParameter,
      guidWord: form.guidWord,
      deviation: form.deviation,
      causes: form.causes,
      consequences: form.consequences,

      existineControl: form.existineControl,
      existineProbability: parseInt(form.existineProbability, 10),
      existingSeverity: parseInt(form.existingSeverity, 10),
      riskRating: parseInt(form.riskRating, 10),

      additionalControl: form.additionalControl,
      additionalProbability: parseInt(form.additionalProbability, 10),
      additionalSeverity: parseInt(form.additionalSeverity, 10),
      additionalRiskRating: parseInt(form.additionalRiskRating, 10),

      node: { id: nodeID },
    };

    const detailRes = await fetch(
      `http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${nodeID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([discussionPayload]),
      }
    );

    const savedDetails = await detailRes.json();
    const nodeDetailId = savedDetails[0].id;
    setCurrentDetailId(nodeDetailId);

    const cleanedRecommendations = form.additionalControl
      .split("\n")
      .map((line) => line.replace(/^•\s*/, "").trim())
      .filter((line) => line !== "");

    const recommendationsList = cleanedRecommendations.map((text) => ({
      recommendation: text,
    }));

    if (recommendationsList.length > 0) {
      for (let rec of recommendationsList) {
        const url = rec.id
          ? `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`
          : `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}/${nodeDetailId}`;

        await fetch(url, {
          method: rec.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rec),
        });
      }
    }

    showToast("Saved Successfully!", "success");
    setForm(initialState);
    setRows(15);
    setSmallRows(7);
    setIsSaved(true);
  } catch (error) {
    console.error("Save Error:", error);
    showToast("Failed to Save", "error");
  } finally {
    setLoading(false);
  }
};

  const handlePrevNext = (direction) => {
    if (!isSaved) {
      showToast("Please save the form before navigating.", "warn");
      return;
    }

    if (details.length === 0) return;

    let newIndex = currentIndex;
    if (direction === "next") newIndex += 1;
    else if (direction === "previous") newIndex -= 1;

    if (newIndex < 0) {
      showToast("No previous record found.", "info");
      return;
    }
    if (newIndex >= details.length) {
      setForm(initialState);
      setIsSaved(true);
      setCurrentIndex(details.length);
      setTempRecommendations([]);
      return;
    }

    const detail = details[newIndex];
    setForm({
      ...detail,
      additionalControl:
        detail.recommendations?.map((r) => r.recommendation).join("\n") || "• ",
    });
    setTempRecommendations(detail.recommendations || []);
    setCurrentDetailId(detail.id);
    setCurrentIndex(newIndex);
    setIsSaved(true);
  };

const handleSaveAndNavigate = async (direction) => {
  if (!isSaved) {
    showToast("Please save the form before navigating.", "warn");
    return;
  }

  if (direction !== "previous") {
    if (!validate()) return;
    await saveCurrentDetails(form);
  }

  handlePrevNext(direction);
};

const saveCurrentDetails = async (currentForm) => {
  setIsSaved(true);
  try {
    setLoading(true);

    // Update Node Detail
    const nodeDetailRes = await fetch(
      `http://${strings.localhost}/api/hazopNodeDetail/update/${currentForm.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentForm),
      }
    );

    if (!nodeDetailRes.ok) throw new Error("Failed to update node detail");

    // Save or update each recommendation
    for (let rec of tempRecommendations) {
      const recPayload = {
        recommendation: rec.recommendation,
        remarkbyManagement: rec.remarkbyManagement,
      };

      const url = rec.id
        ? `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`
        : `http://${strings.localhost}/api/nodeRecommendation/save/${nodeID}/${currentForm.id}`;

      await fetch(url, {
        method: rec.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recPayload),
      });
    }

    showToast("Saved Successfully", "success");
  } catch (error) {
    console.error("Error saving current form:", error);
    showToast("Failed to save changes", "error");
  } finally {
    setLoading(false);
  }
};

  const isAdditionalRequired = () => {
    const riskRating = parseInt(form.riskRating, 10) || 0;
    return riskRating >= 12;
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
      setIsSaved(true);
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
                      
                    </div>
                     <div
  onClick={() => {
    setTempRecommendations((prev) => [
      ...prev,
      { recommendation: "", remarkbyManagement: "", id: null, editing: true }, // Set editing: true for immediate input
    ]);
    setIsSaved(false);
  }}
  style={{ cursor: "pointer" }}
>
  <FaPlus />
</div>

                  </div>
<div className="textareaFont" style={{
  width: "100%",
  padding: "5.5px",
  borderRadius: "9px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none",
  background: "transparent",
  transition: "all 0.2s ease",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  minHeight: "145px"
}}
>
  {tempRecommendations.map((rec, index) => (
    <div key={index} className="recommendation-item" style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
      <span style={{ marginRight: "5px" }}>•</span>
      {rec.editing ? (
        <textarea
  type="text"
  value={rec.recommendation}
  onChange={(e) => {
    setTempRecommendations((prev) =>
      prev.map((r, i) => (i === index ? { ...r, recommendation: e.target.value } : r))
    );
    setForm((prev) => ({
      ...prev,
      additionalControl: tempRecommendations
        .map((r, i) => (i === index ? e.target.value : r.recommendation))
        .join("\n"),
    }));
    setIsSaved(false);
  }}
  onBlur={() => {
    setTempRecommendations((prev) =>
      prev.map((r, i) => (i === index ? { ...r, editing: false } : r))
    );
  }}
  className="textareaFont"
  style={{
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "vertical",
  }}
  autoFocus
/>
      ) : (
        <span
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => {
            setTempRecommendations((prev) =>
              prev.map((r, i) => (i === index ? { ...r, editing: true } : r))
            );
          }}
        >
          {rec.recommendation}
        </span>
      )}
      <div
        onClick={async () => {
          if (!rec.id) {
            const updatedRecs = tempRecommendations.filter((_, i) => i !== index);
            setTempRecommendations(updatedRecs);
            setForm((prev) => ({
              ...prev,
              additionalControl: updatedRecs.map((r) => r.recommendation).join("\n"),
            }));
            showToast("New recommendation removed.", "success");
            return;
          }

          try {
            const deleteResponse = await fetch(
              `http://${strings.localhost}/api/nodeRecommendation/delete/${rec.id}`,
              { method: "DELETE" }
            );
            if (deleteResponse.ok) {
              const updatedRecs = tempRecommendations.filter((_, i) => i !== index);
              setTempRecommendations(updatedRecs);
              setForm((prev) => ({
                ...prev,
                additionalControl: updatedRecs.map((r) => r.recommendation).join("\n"),
              }));
              showToast("Recommendation deleted successfully.", "success");
            } else {
              showToast("Failed to delete recommendation.", "error");
            }
          } catch (error) {
            showToast("Error deleting recommendation.", "error");
          }
        }}
        className="delete-btn"
        style={{ margin: "5px", border: "none", background: "transparent", cursor: "pointer", color: "var(--intolerable)" }}
      >
        <FaMinus />
      </div>
    </div>
  ))}
</div>
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
                disabled={loading}
                onClick={() => handleSaveAndNavigate("previous")}
              >
                Previous
              </button>
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={() => handleSaveAndNavigate("next")}
              >
                Next
              </button>
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to save this discussion and proceed to next?"
          onConfirm={() => {
            setShowConfirmation(false);
            handleSaveAndNext();
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default CreateNodeDetails;
