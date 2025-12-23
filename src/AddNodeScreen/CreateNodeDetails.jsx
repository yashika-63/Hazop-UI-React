import React, { useEffect, useState } from "react";
import { FaEye, FaMinus, FaPlus } from "react-icons/fa";
import { showToast } from "../CommonUI/CommonUI";
import "./Node.css";
import { strings } from "../string";
import { useLocation, useNavigate } from "react-router-dom";
import NodeInfo from "./NodeInfo";
import RiskLevelPopup from "./RiskLevelPopup";
import RibbonButtons from "./RibbonButtons";
import RibbonInfoModal from "./RibbonInfoModal";
import HazopReportPage from "../Reports/HazopReport";
import RibbonNodeList from "./RibbonNodeList";

const initialState = {
  generalParameter: "",
  specificParameter: "",
  guidWord: "",
  discussionContributors: "",
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
  const [rows, setRows] = useState(11);
  const [smallRows, setSmallRows] = useState(8);
  const [loading, setLoading] = useState(false);
  const [tempRecommendations, setTempRecommendations] = useState([]);
  const additionalControlRef = React.useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [recToDelete, setRecToDelete] = useState(null);
  const [recIndexToDelete, setRecIndexToDelete] = useState(null);
  const [currentDetailNo, setCurrentDetailNo] = useState(null);
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nodeID = location.state?.nodeID;
  const [currentNodeId, setCurrentNodeId] = useState(nodeID); // initial node
  const [currentNodeData, setCurrentNodeData] = useState(null);
  const department = currentNodeData?.javaHazopRegistration?.department || null;
  const [showRibbonInfo, setShowRibbonInfo] = useState(false);
  const [showRibbonNodeList, setShowRibbonNodeList] = useState(false);
  const passedDetail = location.state?.detail || null;
  const hazopRegistrationId = currentNodeData?.javaHazopRegistration?.id;

  useEffect(() => {
    const loadPassedDetail = async () => {
      if (!passedDetail) return;

      setCurrentDetailId(passedDetail.id);
      setCurrentDetailNo(passedDetail.nodeDetailNumber);

      // Load recommendations for this detail
      const recRes = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${passedDetail.id}`
      );
      const recs = await recRes.json();

      setForm({
        ...passedDetail,
        additionalControl: recs.map((r) => r.recommendation).join("\n") || "• ",
      });

      setTempRecommendations(recs);
      setIsSaved(true);
    };

    loadPassedDetail();
  }, [passedDetail]);

  useEffect(() => {
    const fetchNode = async () => {
      if (!currentNodeId) return;
      const res = await fetch(
        `http://${strings.localhost}/api/hazopNode/${currentNodeId}`
      );
      if (res.ok) {
        const data = await res.json();
        setCurrentNodeData(data);
      }
    };
    fetchNode();
  }, [currentNodeId]);

  const handleChange = (e) => {
    setIsSaved(false);
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      if (name === "additionalControl") {
        const lines = value
          .split("\n")
          .map((line) => line.replace(/^•\s*/, "").trim())
          .filter((line) => line !== "");
        const recommendations = lines.map((text) => ({
          recommendation: text,
          remarkbyManagement: "",
        }));
        setTempRecommendations(recommendations);
      }

      if (
        name === "causes" ||
        name === "consequences" ||
        name === "deviation"
      ) {
        const lineCount = value.split("\n").length;
        setRows(Math.min(15, Math.max(11, lineCount)));
      }

      if (name === "additionalControl" || name === "existineControl") {
        const lineCount = value.split("\n").length;
        setSmallRows(Math.min(9, Math.max(8, lineCount)));
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
    if (passedDetail) return;
    fetch(
      `http://${strings.localhost}/api/hazopNodeDetail/node/${currentNodeId}`
    )
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }, [nodeID, passedDetail]);

  useEffect(() => {
    if (passedDetail) return;
    const fetchAllDetails = async () => {
      if (!nodeID) return;
      try {
        setLoading(true);
        const res = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`
        );
        // if (!res.ok) throw new Error("Failed to fetch node details");
        const data = await res.json();
        if (data && data.length > 0) {
          setDetails(data);
          setCurrentIndex(0);
          const firstDetail = data[0];
          setCurrentDetailNo(firstDetail.nodeDetailNumber);
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
  }, [nodeID, passedDetail]);

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
    if (!form.discussionContributors.trim()) {
      showToast("Team Members are required.", "warn");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const previousDetailNo =
        currentDetailId === null && currentDetailNo
          ? currentDetailNo
          : currentDetailNo || 0;
      const nodeDetailResponse = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${currentNodeId}?previousDetailNo=${previousDetailNo}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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

        const cleanedRecommendations = form.additionalControl
          .split("\n")
          .map((line) => line.replace(/^•\s*/, "").trim())
          .filter((line) => line !== "");

        const recommendationsList = cleanedRecommendations.map(
          (text, index) => {
            const existingRec = tempRecommendations[index];
            return {
              id: existingRec?.id,
              recommendation: text,
              remarkbyManagement: existingRec?.remarkbyManagement || "",
              department: department,
            };
          }
        );

        // Send recommendations as an array
        const recommendationsResponse = await fetch(
          `http://${strings.localhost}/api/nodeRecommendation/save/${currentNodeId}/${nodeDetailId}`,
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
    if (passedDetail) return;
    const fetchFirstNodeDetail = async () => {
      if (!nodeID) return;

      try {
        setLoading(true);
        const res = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/node/${currentNodeId}`
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
          setCurrentDetailNo(detail.nodeDetailNumber);
        }
      } catch (err) {
        console.error("Error fetching node details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstNodeDetail();
  }, [nodeID, passedDetail]);

  const fetchDetailByDirection = async (direction) => {
    if (!nodeID) return null;

    try {
      setLoading(true);
      let url = `http://${strings.localhost}/api/hazopNodeDetail/getByDirectionNew?nodeId=${currentNodeId}&direction=${direction}`;
      if (
        currentDetailId !== null &&
        currentDetailNo !== null &&
        currentDetailNo !== undefined
      ) {
        url += `&currentDetailNumber=${currentDetailNo}`;
      }
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data || null;
    } catch (error) {
      console.error("Error fetching node detail by direction:", error);
      showToast("Failed to load the deviation.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const discussionPayload = {
        generalParameter: form.generalParameter,
        specificParameter: form.specificParameter,
        guidWord: form.guidWord,
        discussionContributors: form.discussionContributors,
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

      const previousDetailNo =
        currentDetailId === null && currentDetailNo
          ? currentDetailNo
          : currentDetailNo || 0;
      const detailRes = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${currentNodeId}?previousDetailNo=${previousDetailNo}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discussionPayload),
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
        department: department,
      }));

      if (recommendationsList.length > 0) {
        for (let rec of recommendationsList) {
          const url = rec.id
            ? `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`
            : `http://${strings.localhost}/api/nodeRecommendation/save/${currentNodeId}/${nodeDetailId}`;

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

  const handlePrevNextNode = async (direction) => {
    if (!isSaved) {
      showToast("Please save the form before switching nodes.", "warn");
      return;
    }
    const nextNode = await fetchNodeByDirection(direction);
    if (!nextNode) {
      showToast(
        direction === "previous"
          ? "No previous node found."
          : "No next node found.",
        "info"
      );
      return;
    }
    setCurrentNodeId(nextNode.id);
    try {
      setLoading(true);
      const res = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/node/${nextNode.id}`
      );
      const contentType = res.headers.get("content-type");
      let detailsData = null;

      if (contentType && contentType.includes("application/json")) {
        detailsData = await res.json();
      } else {
        const textResponse = await res.text();
        detailsData = textResponse;
      }
      const noDeviation =
        !detailsData ||
        typeof detailsData === "string" ||
        (detailsData.message &&
          detailsData.message.includes("No node details")) ||
        (Array.isArray(detailsData) && detailsData.length === 0);

      if (noDeviation) {
        setForm(initialState);
        setTempRecommendations([]);
        setCurrentDetailId(null);
        setCurrentIndex(0);
        setIsSaved(true);

        showToast("Blank form opened for this node.", "info");
        return;
      }
      const firstDetail = detailsData[0];
      const recsRes = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${firstDetail.id}`
      );
      const recommendations = await recsRes.json();
      setForm({
        ...firstDetail,
        additionalControl:
          recommendations.map((r) => r.recommendation).join("\n") || "• ",
      });
      setTempRecommendations(recommendations);
      setCurrentDetailId(firstDetail.id);
      setCurrentIndex(0);
      setIsSaved(true);
    } catch (err) {
      console.error("Error loading node details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevNext = async (direction) => {
    if (!isSaved) {
      showToast("Please save the form before navigating.", "warn");
      return;
    }
    if (!currentDetailId && direction === "previous") {
      const lastRecord = await fetchDetailByDirection("previous");
      if (!lastRecord) {
        showToast("No previous record found.", "info");
        return;
      }
      const recs = await loadRecommendations(lastRecord.id);
      setForm({
        ...lastRecord,
        additionalControl: recs.map((r) => r.recommendation).join("\n") || "• ",
      });

      setTempRecommendations(recs);
      setCurrentDetailId(lastRecord.id);
      setCurrentDetailNo(lastRecord.nodeDetailNumber);
      return;
    }
    const nextDetail = await fetchDetailByDirection(direction);
    if (!nextDetail && direction === "next") {
      setForm(initialState);
      setTempRecommendations([]);
      setCurrentDetailId(null);
      showToast("Blank form opened. Enter new details.", "info");
      return;
    }
    if (!nextDetail && direction === "previous") {
      showToast("No previous record found.", "info");
      return;
    }
    const recs = await loadRecommendations(nextDetail.id);
    setForm({
      ...nextDetail,
      additionalControl: recs.map((r) => r.recommendation).join("\n") || "• ",
    });
    setTempRecommendations(recs);
    setCurrentDetailId(nextDetail.id);
    setCurrentDetailNo(nextDetail.nodeDetailNumber);
  };

  const handleAddDiscussionNext = () => {
    if (!isSaved) {
      showToast("Please save the current deviation first.", "warn");
      return;
    }
    setForm(initialState);
    setTempRecommendations([]);
    setCurrentDetailId(null);
    setCurrentIndex(details.length);
    setIsSaved(true);
    showToast("Blank form opened. Add new deviation.", "info");
  };

  const loadRecommendations = async (detailId) => {
    try {
      const res = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detailId}`
      );
      if (!res.ok) return [];

      return await res.json();
    } catch (e) {
      console.error("Error loading recommendations:", e);
      return [];
    }
  };

  const fetchNodeByDirection = async (direction) => {
    if (!nodeID) return null; // fallback

    try {
      setLoading(true);
      const currentIdParam = currentNodeId || 0;

      const nodeRes = await fetch(
        `http://${strings.localhost}/api/hazopNode/${currentNodeId}`
      );
      if (!nodeRes.ok) throw new Error("Failed to fetch node");

      const nodeData = await nodeRes.json();
      const registrationId = nodeData.javaHazopRegistration?.id || 0;

      const res = await fetch(
        `http://${strings.localhost}/api/hazopNode/node/getByDirection?currentId=${currentIdParam}&registrationId=${registrationId}&direction=${direction}`
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data || null;
    } catch (error) {
      console.error("Error fetching node by direction:", error);
      showToast("Failed to fetch node.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (rec, index) => {
    setRecToDelete(rec);
    setRecIndexToDelete(index);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!recToDelete) return;

    setShowDeleteConfirmation(false);
    setLoading(true);

    try {
      const updatedRecs = tempRecommendations.filter(
        (_, i) => i !== recIndexToDelete
      );

      const updatedForm = {
        ...form,
        additionalControl: updatedRecs.map((r) => r.recommendation).join("\n"),
      };

      setTempRecommendations(updatedRecs);
      setForm(updatedForm);

      if (recToDelete.id) {
        const deleteRes = await fetch(
          `http://${strings.localhost}/api/nodeRecommendation/delete/${recToDelete.id}`,
          { method: "DELETE" }
        );

        if (!deleteRes.ok) throw new Error("Failed to delete recommendation");
      }

      if (currentDetailId) {
        const updateRes = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/update/${currentDetailId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedForm),
          }
        );

        if (!updateRes.ok) {
          throw new Error("Failed to update node details");
        }
      }
      showToast("Recommendation deleted successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Error deleting recommendation.", "error");
    } finally {
      setLoading(false);
      setRecToDelete(null);
      setRecIndexToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRecToDelete(null);
    setRecIndexToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const isAdditionalRequired = () => {
    const riskRating = parseInt(form.riskRating, 10) || 0;
    return riskRating >= 12;
  };

  const renderScaleSelect = (name, value, style) => (
    <select name={name} value={value} onChange={handleChange} style={style}>
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
    <div style={{ marginTop: '-20px' }}>
      <RibbonButtons
        handleSubmit={handleSubmit}
        handlePrevNext={handlePrevNext}
        handleAddDiscussionNext={handleAddDiscussionNext}
        handlePrevNextNode={handlePrevNextNode}
        currentNodeData={currentNodeData}
        setShowRiskPopup={setShowRiskPopup}
        setShowRibbonInfo={setShowRibbonInfo}
        setShowRibbonNodeList={setShowRibbonNodeList}
        navigate={navigate}
        handleOpenReport={() => setShowReportPopup(true)}
      />
      <NodeInfo currentNodeId={currentNodeId} />

      <div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>General Parameter
                  </div>
                  <small
                    className={`char-count ${form.generalParameter.length >= 1000
                      ? "limit-reached"
                      : ""
                      }`}
                  >
                    {form.generalParameter.length}/1000
                  </small>
                </label>
                <input
                  type="text"
                  name="generalParameter"
                  value={form.generalParameter}
                  onChange={handleChange}
                  maxLength={1000}
                />
              </div>
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Specific Parameter
                  </div>
                  <small
                    className={`char-count ${form.specificParameter.length >= 1000
                      ? "limit-reached"
                      : ""
                      }`}
                  >
                    {form.specificParameter.length}/1000
                  </small>
                </label>
                <input
                  type="text"
                  name="specificParameter"
                  value={form.specificParameter}
                  onChange={handleChange}
                  maxLength={1000}
                />
              </div>
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Guide Word
                  </div>
                  <small
                    className={`char-count ${form.guidWord.length >= 1000 ? "limit-reached" : ""
                      }`}
                  >
                    {form.guidWord.length}/1000
                  </small>
                </label>
                <input
                  type="text"
                  name="guidWord"
                  value={form.guidWord}
                  onChange={handleChange}
                  maxLength={1000}
                />
              </div>
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Team Members
                  </div>
                </label>
                <input
                  type="text"
                  name="discussionContributors"
                  value={form.discussionContributors}
                  onChange={handleChange}
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="input-row-node">
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Deviation
                  </div>
                  <small
                    className={`char-count ${form.deviation.length >= 5000 ? "limit-reached" : ""
                      }`}
                  >
                    {form.deviation.length}/5000
                  </small>
                </label>
                <textarea
                  name="deviation"
                  rows={rows}
                  value={form.deviation}
                  onChange={handleChange}
                  className="textareaFont"
                  maxLength={5000}
                />
              </div>
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Causes
                  </div>
                  <small
                    className={`char-count ${form.causes.length >= 5000 ? "limit-reached" : ""
                      }`}
                  >
                    {form.causes.length}/5000
                  </small>
                </label>
                <textarea
                  name="causes"
                  rows={rows}
                  value={form.causes}
                  onChange={handleChange}
                  className="textareaFont"
                  maxLength={5000}
                />
              </div>
              <div className="form-group">
                <label className="table-header">
                  <div>
                    <span className="required-marker">*</span>Consequences
                  </div>
                  <small
                    className={`char-count ${form.consequences.length >= 5000 ? "limit-reached" : ""
                      }`}
                  >
                    {form.consequences.length}/5000
                  </small>
                </label>
                <textarea
                  name="consequences"
                  rows={rows}
                  value={form.consequences}
                  onChange={handleChange}
                  className="textareaFont"
                  maxLength={5000}
                />
              </div>

              <div>
                <div className="form-group">
                  <label className="table-header">
                    <div>Existing Control</div>
                    <small
                      className={`char-count ${form.existineControl.length >= 5000
                        ? "limit-reached"
                        : ""
                        }`}
                    >
                      {form.existineControl.length}/5000
                    </small>
                  </label>
                  <textarea
                    name="existineControl"
                    rows={smallRows}
                    value={form.existineControl}
                    onChange={handleChange}
                    className="textareaFont"
                    maxLength={5000}
                  />
                </div>

                <div className="metric-row">
                  <div className="form-group">
                    <label>
                      <span className="required-marker">*</span>P
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
                      <span className="required-marker">*</span>S
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
                  <div className="form-group">
                    <label>
                      {" "}
                      <span className="required-marker">*</span>R
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
                </div>
                <small
                  className={`risk-text ${getRiskTextClass(
                    form.riskRating
                  )} metric-single`}
                  style={{ textAlign: "center" }}
                >
                  {getRiskLevelText(form.riskRating)}
                </small>
              </div>
              <div>
                <div className="form-group">
                  <div className="label-row">
                    <div style={{ marginBottom: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div >
                        {isAdditionalRequired() && <span className="required-marker">*</span>}
                        <span style={{ fontSize: '14px' }}> Additional Control</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 'normal',
                          marginLeft: '4px',
                          color: form.additionalControl.length >= 5000 ? 'red' : '#666'
                        }}>
                          ({form.additionalControl.length}/5000)
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={addBulletPoint}
                      style={{ cursor: "pointer" }}
                    ></div>
                    <div
                      onClick={() => {
                        setTempRecommendations((prev) => [
                          ...prev,
                          {
                            recommendation: "",
                            remarkbyManagement: "",
                            id: null,
                            editing: true,
                          },
                        ]);
                        setIsSaved(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <FaPlus />
                    </div>
                  </div>
                  <div className="textareaFont recommendation-textarea-style">
                    {tempRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="recommendation-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <span style={{ marginRight: "5px" }}>•</span>
                        {rec.editing ? (
                          <textarea
                            type="text"
                            value={rec.recommendation}
                            onChange={(e) => {
                              const updatedRecs = tempRecommendations.map(
                                (r, i) =>
                                  i === index
                                    ? { ...r, recommendation: e.target.value }
                                    : r
                              );
                              setTempRecommendations(updatedRecs);
                              setForm((prev) => ({
                                ...prev,
                                additionalControl: updatedRecs
                                  .map((r) => r.recommendation)
                                  .join("\n"),
                              }));
                              setIsSaved(false);
                            }}
                            onBlur={() => {
                              setTempRecommendations((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? {
                                      ...r,
                                      editing: r.recommendation.trim() === "",
                                    }
                                    : r
                                )
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
                                prev.map((r, i) =>
                                  i === index ? { ...r, editing: true } : r
                                )
                              );
                            }}
                          >
                            {rec.recommendation}
                          </span>
                        )}
                        <div
                          onClick={() => handleDeleteClick(rec, index)}
                          className="delete-btn"
                          style={{
                            margin: "5px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--intolerable)",
                          }}
                        >
                          <FaMinus />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
                <div className="metric-row">
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">* </span>
                      )}
                      P
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
                      S
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
                  <div className="form-group">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">* </span>
                      )}
                      R
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
                </div>
                <small
                  className={`risk-text ${getRiskTextClass(
                    form.additionalRiskRating
                  )} metric-single`}
                  style={{ textAlign: "center" }}
                >
                  {getRiskLevelText(form.additionalRiskRating)}
                </small>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showReportPopup && currentNodeData?.javaHazopRegistration?.id && (
        <HazopReportPage
          hazopId={currentNodeData.javaHazopRegistration.id}
          onClose={() => setShowReportPopup(false)}
        />
      )}
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

      {showDeleteConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to delete this recommendation?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {showRibbonInfo && (
        <RibbonInfoModal
          show={showRibbonInfo}
          onClose={() => setShowRibbonInfo(false)}
        />
      )}

      {showRibbonNodeList && (
        <RibbonNodeList
          show={showRibbonNodeList}
          onClose={() => setShowRibbonNodeList(false)}
          registrationId = {hazopRegistrationId}
          />
      )}

      {showRiskPopup && (
        <RiskLevelPopup onClose={() => setShowRiskPopup(false)} />
      )}
    </div>
  );
};

export default CreateNodeDetails;
