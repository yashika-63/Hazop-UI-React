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
  FaTimes,
} from "react-icons/fa";

const RibbonInfoModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="small-modal-overlay">
      <div className="small-modal-box">
        <div className="modal-content">
                  <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                  </button>
                  <h2 className="modal-header">Toolbar Information</h2>
                </div>
        <ul>
          <li><FaSave /> Save</li>
          <li><FaArrowLeft /> Previous Deviation</li>
          <li><FaArrowRight /> Next Deviation</li>
          <li><FaPlusSquare /> Add Deviation Next</li>
          <li><FaStepBackward /> Previous Node</li>
          <li><FaStepForward /> Next Node</li>
          <li><FaPlus /> Add Node</li>
          <li><FaEye /> View Risk Matrix</li>
          <li><FaInfoCircle /> Ribbon Info</li>
        </ul>
      </div>
    </div>
  );
};

export default RibbonInfoModal;
