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
          <h2 className="modal-header">Toolbar Information</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Table Format */}
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Icon</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <FaSave />
              </td>
              <td>Save</td>
            </tr>
            <tr>
              <td>2</td>
              <td>
                <FaArrowLeft />
              </td>
              <td>Previous Deviation</td>
            </tr>
            <tr>
              <td>3</td>
              <td>
                <FaArrowRight />
              </td>
              <td>Next Deviation</td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                <FaPlusSquare />
              </td>
              <td>Add Deviation Next</td>
            </tr>
            <tr>
              <td>5</td>
              <td>
                <FaStepBackward />
              </td>
              <td>Previous Node</td>
            </tr>
            <tr>
              <td>6</td>
              <td>
                <FaStepForward />
              </td>
              <td>Next Node</td>
            </tr>
            <tr>
              <td>7</td>
              <td>
                <FaPlus />
              </td>
              <td>Add Node</td>
            </tr>
            <tr>
              <td>8</td>
              <td>
                <FaEye />
              </td>
              <td>View Risk Matrix</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RibbonInfoModal;
