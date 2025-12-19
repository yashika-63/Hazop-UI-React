import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleChange, validate } from './formHandlers';
import { fetchNode, fetchAllDetails, loadNodeDetails, reloadDetails, handleSubmit } from './apiHandlers';
import { handleSaveAndNext, handlePrevNextNode, handlePrevNext, openNextRecord, loadRecommendations, fetchNodeByDirection, saveCurrentDetails, handleDeleteClick, confirmDelete, cancelDelete } from './navigationHandlers';
import { isAdditionalRequired, renderScaleSelect, getBorderColor, getRiskClass, getRiskLevelText, getRiskTextClass } from './riskCalculations.jsx';
import { addBulletPoint, useRecommendationEffect } from './recommendationHandlers';
import NodeInfo from '../AddNodeScreen/NodeInfo';
import { useNodeFormState } from './StateManagement';
import { showToast } from '../CommonUI/CommonUI.jsx';

const MainComponent = () => {
  const {
    form,
    setForm,
    rows,
    setRows,
    smallRows,
    setSmallRows,
    loading,
    setLoading,
    tempRecommendations,
    setTempRecommendations,
    showConfirmation,
    setShowConfirmation,
    currentDetailId,
    setCurrentDetailId,
    details,
    setDetails,
    currentIndex,
    setCurrentIndex,
    isSaved,
    setIsSaved,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    recToDelete,
    setRecToDelete,
    recIndexToDelete,
    setRecIndexToDelete,
    currentNodeId,
    setCurrentNodeId,
    currentNodeData,
    setCurrentNodeData,
  } = useNodeFormState();

  const additionalControlRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const nodeID = location.state?.nodeID;

  useEffect(() => {
    fetchNode(currentNodeId, setCurrentNodeData);
  }, [currentNodeId]);

  useEffect(() => {
    fetchAllDetails(nodeID, setDetails, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setIsSaved, setLoading, showToast);
  }, [nodeID]);

  useRecommendationEffect(form, setForm, setIsSaved);

  const [isNodePopupOpen, setIsNodePopupOpen] = useState(false);

  const handleOpenNodePopup = () => setIsNodePopupOpen(true);
  const handleCloseNodePopup = () => setIsNodePopupOpen(false);
  const handleSaveNode = async () => {
    if (currentNodeId) {
      await loadNodeDetails(currentNodeId, setDetails, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setLoading, showToast);
    }
    setIsNodePopupOpen(false);
  };

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Add Deviation</h1>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h1></h1>
          <button
            type="button"
            className="add-btn"
            onClick={() =>
              navigate("/NodePopup", {
                state: {
                  registrationId: currentNodeData?.javaHazopRegistration?.id, // explicitly name it registrationId
                  hazopData: currentNodeData?.javaHazopRegistration,
                  redirectTo: "/hazop-details",
                },
              })
            }
          >
            + Add Node
          </button>
        </div>
      </div>

      <NodeInfo currentNodeId={currentNodeId} />

      <div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="form-group">
                <label className='table-header'>
                  <div>
                    <span className="required-marker">*</span>General Parameter
                  </div>
                  <small
                    className={`char-count ${form.generalParameter.length >= 1000 ? "limit-reached" : ""
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
                <label className='table-header'>
                  <div>
                    <span className="required-marker">*</span>Specific Parameter
                  </div>
                  <small
                    className={`char-count ${form.specificParameter.length >= 1000 ? "limit-reached" : ""
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
                <label className='table-header'>
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
            </div>

            <div className="input-row-node">
              <div className="form-group">
                <label className='table-header'>
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
                <label className='table-header'>
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
                <label className='table-header'>
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
                  <label className='table-header'>
                    <div>
                      <span className="required-marker">*</span>Existing Control
                    </div>
                    <small
                      className={`char-count ${form.existineControl.length >= 5000 ? "limit-reached" : ""
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
                      {" "}
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
                      {" "}
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
                <div className="form-group existing-control">
                  <div className="label-row">
                    <label>
                      {isAdditionalRequired() && (
                        <span className="required-marker">*</span>
                      )}
                      Additional Control
                    </label>

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
                  <div
                    className="textareaFont"
                    style={{
                      width: "100%",
                      padding: "5.5px",
                      borderRadius: "9px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      outline: "none",
                      background: "transparent",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      maxHeight: "300px",
                      minHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
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
                                  i === index ? { ...r, editing: false } : r
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
                  <small
                    className={`char-count ${form.additionalControl.length >= 5000
                      ? "limit-reached"
                      : ""
                      }`}
                    style={{ marginTop: "9px" }}
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

            <div className="center-controls">
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={() => handlePrevNext("previous")}
              >
                Previous Discussion
              </button>
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={() => handlePrevNext("next")}
              >
                Next Discussion
              </button>
            </div>
            <div className="center-controls">
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={() => handlePrevNextNode("previous")}
              >
                Previous Node
              </button>
              <button
                type="button"
                className="save-btn"
                disabled={loading}
                onClick={() => handlePrevNextNode("next")}
              >
                Next Node
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to save this deviation and proceed to next?"
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
    </div>
  );
};

export default MainComponent;
