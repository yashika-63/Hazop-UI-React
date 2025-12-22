import React from "react";
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
} from "react-icons/fa";

const RibbonButtons = ({
  handleSubmit,
  handlePrevNext,
  handleAddDiscussionNext,
  handlePrevNextNode,
  currentNodeData,
  setShowRiskPopup,
  setShowRibbonInfo,
  navigate,
}) => {
  return (
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
  );
};

export default RibbonButtons;
