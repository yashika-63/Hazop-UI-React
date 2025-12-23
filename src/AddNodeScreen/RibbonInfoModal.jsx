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
  FaFilePdf, 
  FaFileExcel,
  FaCloudUploadAlt,
  FaListOl,
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
        <div className="table-responsive">
          <table className="node-details-table">
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
                  <FaListOl />
                </td>
                <td>Node List</td>
              </tr>

              <tr>
                <td>9</td>
                <td>
                  <FaFilePdf /> / <FaFileExcel />
                </td>
                <td>Generate Reports (PDF / Excel)</td>
              </tr>
              <tr>
                <td>10</td>
                <td>
                  <FaCloudUploadAlt />{" "}
                </td>
                <td>Upload Documents</td>
              </tr>
              <tr>
                <td>11</td>
                <td>
                  <FaEye />
                </td>
                <td>View Risk Matrix</td>
              </tr>

              <tr>
                <td>12</td>
                <td>
                  <FaInfoCircle />
                </td>
                <td>Ribbon Information</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RibbonInfoModal;
