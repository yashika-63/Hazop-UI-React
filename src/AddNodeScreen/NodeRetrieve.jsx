import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const NodeRetrieve = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const registrationId = location.state?.hazopRegistrationId;

  const fetchNodes = async () => {
    if (!registrationId) {
      console.error("No hazop registration ID received");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${strings.localhost}/api/hazopNode/by-registration-status`,
        {
          params: {
            registrationId: registrationId,
            status: false,
          },
        }
      );
      setNodes(res.data);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const activateNode = async (nodeId) => {
    try {
      await axios.put(`${strings.localhost}/api/hazopNode/update/${nodeId}`, {
        Status: true,
      });
      setNodes((prev) => prev.filter((node) => node.id !== nodeId));
      showToast("Node retrieve successfully.", "success");
    } catch (error) {
      console.error("Error activating node:", error);
      showToast("Error retrieving node.", "error");
    }
  };

  useEffect(() => {
    if (registrationId) {
      fetchNodes();
    }
  }, [registrationId]);

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>List of Inactive Nodes</h1>
      </div>

      {!loading && (
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>ID</th>
              <th>Design Intent</th>
              <th>Registration Date</th>
              <th style={{ width: "10%" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {nodes.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No inactive nodes found.
                </td>
              </tr>
            ) : (
              nodes.map((node, index) => (
                <tr key={node.id}>
                  <td>{index + 1}</td>
                  <td>{node.id}</td>
                  <td>{node.designIntent}</td>
                  <td>{formatDate(node.registrationDate)}</td>
                  <td>
                    <div
                      style={{
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                      onClick={() => activateNode(node.id)}
                    >
                      Activate
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NodeRetrieve;
