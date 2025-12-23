import React, { useState, useRef } from "react";
import {
  FaSave,
  FaArrowLeft,
  FaArrowRight,
  FaPlusSquare,
  FaInfoCircle,
  FaStepBackward,
  FaStepForward,
  FaPlus,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaCloudUploadAlt,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import HazopDocumentUpload from "../HazopEntry/HazopDocumentUpload";

const RibbonButtons = ({
  handleSubmit,
  handlePrevNext,
  handleAddDiscussionNext,
  handlePrevNextNode,
  currentNodeData,
  setShowRiskPopup,
  setShowRibbonInfo,
  navigate,
  handleOpenReport,
  handleGeneratePdf,
  handleGenerateExcel
}) => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const uploadRef = useRef(null);
  const currentHazopId = currentNodeData?.javaHazopRegistration?.id;

  const handleTriggerUpload = async () => {
    if (uploadRef.current && currentHazopId) {
      await uploadRef.current.uploadDocuments(currentHazopId);
    } else {
      if (!currentHazopId) alert("No Hazop ID found to link documents.");
    }
  };

  return (
    <>
      <div className="hazop-info1">
        <div className="header-flex">
          <button className="nd-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {/* Deviation Buttons (GREEN) */}
          <div className="center-controls1">
            <button
              className="ribbon-deviation"
              title="Save"
              onClick={handleSubmit}
            >
              <FaSave />
            </button>

            <button
              className="ribbon-deviation"
              title="Previous Deviation"
              onClick={() => handlePrevNext("previous")}
            >
              <FaArrowLeft />
            </button>

            <button
              className="ribbon-deviation"
              title="Next Deviation"
              onClick={() => handlePrevNext("next")}
            >
              <FaArrowRight />
            </button>

            <button
              className="ribbon-deviation"
              title="Add Deviation Next"
              onClick={handleAddDiscussionNext}
            >
              <FaPlusSquare />
            </button>

            {/* Node Buttons (BLUE) */}
            <button
              className="ribbon-node"
              title="Previous Node"
              onClick={() => handlePrevNextNode("previous")}
            >
              <FaStepBackward />
            </button>

            <button
              className="ribbon-node"
              title="Next Node"
              onClick={() => handlePrevNextNode("next")}
            >
              <FaStepForward />
            </button>

            <button
              type="button"
              className="ribbon-node"
              title="Add Node"
              onClick={() =>
                navigate("/NodePopup", {
                  state: {
                    registrationId: currentNodeData?.javaHazopRegistration?.id,
                    hazopData: currentNodeData?.javaHazopRegistration,
                    redirectTo: "/hazop-details",
                  },
                })
              }
            >
              <FaPlus />
            </button>

            <button
              className="ribbon-document"
              title="Generate Reports (PDF/Excel)"
              onClick={handleOpenReport}
            >
              <FaFilePdf />
            </button>

            {/* --- UPLOAD BUTTON --- */}
            <button
              className="ribbon-document"
              title="Upload Documents"
              onClick={() => setShowUploadPopup(true)}
            >
              <FaCloudUploadAlt />
            </button>

            <button
              className="ribbon-view"
              title="View Risk Matrix"
              onClick={() => setShowRiskPopup(true)}
            >
              <FaEye />
            </button>

            <button
              className="ribbon-view"
              title="Ribbon Info"
              onClick={() => setShowRibbonInfo(true)}
            >
              <FaInfoCircle />
            </button>
          </div>
        </div>
      </div>

      {showUploadPopup && (
        <div className="small-modal-overlay">
          <div className="small-modal-box" >
            <div className="modal-content">
              <h2 className="modal-header" >
                <FaCloudUploadAlt /> Upload Documents
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowUploadPopup(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: "10px" }}>
              <HazopDocumentUpload
                ref={uploadRef}
                disabled={false}
              />
            </div>

            <div className="center-controls">
              <button
                type="button"
                className="save-btn"
                onClick={handleTriggerUpload}
              >
                <FaCheck /> Start Upload
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default RibbonButtons;