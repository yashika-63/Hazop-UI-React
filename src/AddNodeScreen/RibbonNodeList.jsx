import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { strings } from "../string";
import { formatDate } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";

const RibbonNodeList = ({ show, onClose, registrationId }) => {
  const [nodeList, setNodeList] = useState([]);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  useEffect(() => {
    if (show && registrationId) {
      fetchNodeList();
    }
  }, [show, registrationId]);

  const fetchNodeList = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${registrationId}&status=true`
      );
      const data = await response.json();
      setNodeList(data);
    } catch (error) {
      console.error("Error fetching node list:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <h2 className="modal-header">Node List</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Table Format */}
        <div className="table-responsive">
          {nodeList.length > 0 && (
            <table className="hazoplist-table">
              <thead>
                <tr>
                 <th>Sr. No.</th>
                <th>Node No.</th>
                <th>Registration Date</th>
                <th>Design Intent</th>
                <th>Completion Status</th>
                </tr>
              </thead>

              <tbody>
                            {nodeList.map((n, idx) => (
                              <tr
                                key={n.id}
                                onClick={() =>
                                  navigate(`/NodeDetails`, { state: { id: n.id } })
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <td>{idx + 1}</td>
                                <td>{n.nodeNumber}</td>
                                <td>{formatDate(n.registrationDate)}</td>
                                <td>{n.designIntent}</td>
                                <td>
                                  <span
                                    className={
                                      n.completionStatus
                                        ? "status-completed"
                                        : "status-pending"
                                    }
                                  >
                                    {n.completionStatus ? "Completed" : "Ongoing"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};

export default RibbonNodeList;
