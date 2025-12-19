import React, { useState, useEffect } from "react";
import "./Node.css";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { strings } from "../string";
import { FaEdit, FaEllipsisV } from "react-icons/fa";
import { FaSquareCheck } from "react-icons/fa6";
import NodePopup from "./NodePopup";

const NodePage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [originalTeam, setOriginalTeam] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mocDetails, setMocDetails] = useState(null);
  const [hasMoc, setHasMoc] = useState(false);
  const [hazopData, setHazopData] = useState();
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const setSelectedRevisionId = (id) => {
    console.log("Selected revision ID:", id);
    // Add your completion logic here later
  };

  useEffect(() => {
    // Retrieve the data from localStorage
    const storedHazopData = localStorage.getItem("hazopData");
    const storedHazopTeam = localStorage.getItem("hazopTeam");

    if (storedHazopData) {
      setHazopData(JSON.parse(storedHazopData));
    }

    if (storedHazopTeam) {
      setHazopTeam(JSON.parse(storedHazopTeam));
    }
  }, []);

  const fetchNodes = async () => {
    if (!hazopData?.id) {
      console.error("No hazopData or hazopData.id available");
      return;
    }
    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopData.id}&status=true`
      );
      setNodes(response.data);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  };

  useEffect(() => {
    if (!hazopData?.id) {
      console.log("No hazopData or hazopData.id is missing");
      return;
    }
    fetchNodes();
    fetchNodes();
  }, [hazopData]);

  const handleSaveNode = async () => {
    await fetchNodes();
    setShowPopup(false);
  };

  useEffect(() => {
    setShowFullDescription(false);
  }, [hazopData]);

  useEffect(() => {
    if (hazopData && hazopData.id) {
      fetchExistingTeam(hazopData.id);
    }
  }, [hazopData]);

  const fetchExistingTeam = async (hazopId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`
      );
      setHazopTeam(response.data || []);
      setOriginalTeam(response.data || []);
    } catch (err) {
      console.error("Error fetching team:", err);
      showToast("Failed to load existing team.", "error");
    }
    setLoading(false);
  };

  const renderDropdown = (item) => (
    <div className="dropdown">
      <button
        className="dots-button"
        onClick={(e) => {
          toggleDropdown(item.id);
        }}
      >
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button
            type="button"
            onClick={(e) => {
              setSelectedRevisionId(item.id);
            }}
          >
            <FaSquareCheck /> Complete
          </button>
        </div>
      )}
    </div>
  );

  const loadDocuments = async (hazopId) => {
    try {
      const res = await axios.get(
        `http://${strings.localhost}/api/javaHazopDocument/getByKeys`,
        {
          params: {
            companyId: localStorage.getItem("companyId") || 1,
            primeryKey: "HAZOPFIRSTPAGEID",
            primeryKeyValue: hazopId,
          },
        }
      );
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading HAZOP documents:", err);
    }
  };

  const fetchMocDetails = async () => {
    try {
      const res = await axios.get(
        `http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopData.id}`
      );

      setMocDetails(res.data);
      setHasMoc(true);
    } catch (err) {
      console.error("MOC Error:", err);

      setHasMoc(false);
      setMocDetails(null);
    }
  };
  useEffect(() => {
    if (!hazopData?.id) return;
    fetchMocDetails();
    loadDocuments(hazopData.id);
  }, [hazopData]);

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Hazop Information</h1>
      </div>
      <div className="hazop-info">
        {hazopData ? (
          <div className="hazop-info-grid">
            <div>
              <strong>ID:</strong> {hazopData.id}
            </div>
            <div>
              <strong>Title:</strong> {hazopData.hazopTitle}
            </div>
            <div>
              <strong>Site:</strong> {hazopData.site}
            </div>
            <div>
              <strong>Department:</strong> {hazopData.department}
            </div>
            <div>
              <strong>Hazop Date:</strong> {formatDate(hazopData.hazopDate)}
            </div>
            <div>
              <strong>Completion Status:</strong>{" "}
              <span
                className={
                  hazopData?.completionStatus === true
                    ? "status-completed"
                    : "status-pending"
                }
              >
                {hazopData.completionStatus ? "Completed" : "Ongoing"}
              </span>
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {hazopData.status ? "Active" : "Inactive"}
            </div>
            <div>
              <strong>Send for Verification:</strong>{" "}
              {hazopData.sendForVerification ? "Yes" : "No"}
            </div>
            <div>
              <strong>Created By:</strong> {hazopData.createdBy || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {hazopData.createdByEmail || "N/A"}
            </div>
            {hazopData.hazopRevisionNo && (
              <div>
                <strong>Hazop Revision No.:</strong> {hazopData.hazopRevisionNo}
              </div>
            )}
            <div className="full-width">
              <strong>Description:</strong>
              <div
                className={
                  showFullDescription ? "description-full" : "description-clamp"
                }
              >
                {hazopData.description}
              </div>
              {hazopData.description && hazopData.description.length > 100 && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="read-more-btn"
                >
                  {showFullDescription ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p>No HAZOP data available.</p>
        )}

        <div className="rightbtn-controls">
          <h6
            style={{ cursor: "pointer", marginRight: "20px" }}
            onClick={() => setShowDocuments(!showDocuments)}
          >
            View Hazop Documents: {documents.length}
          </h6>
          <h6
            style={{ cursor: "pointer" }}
            onClick={() => setShowAllMembers(!showAllMembers)}
          >
            View Hazop Team
          </h6>
        </div>

        {showAllMembers && (
          <div className="table-section">
            <div className="card table-card">
              <table>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Employee Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Email Id</th>
                  </tr>
                </thead>
                <tbody>
                  {hazopTeam.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No members added yet.
                      </td>
                    </tr>
                  ) : (
                    hazopTeam.map((m, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{m.empCode}</td>
                        <td>
                          {m.firstName} {m.lastName}
                        </td>
                        <td>{m.dimension1}</td>
                        <td>{m.emailId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasMoc && mocDetails && (
          <div>
            <h1>MOC Details</h1>

            {mocDetails.length > 0 ? (
              mocDetails.map((moc, index) => (
                <div key={moc.id} className="hazop-info-grid">
                  <div>
                    <strong>MOC ID:</strong> {moc.id}
                  </div>
                  <div>
                    <strong>MOC No.:</strong> {moc.mocNo}
                  </div>
                  <div>
                    <strong>Register Date:</strong>{" "}
                    {formatDate(moc.registerDate)}
                  </div>
                  <div>
                    <strong>MOC Date:</strong> {formatDate(moc.mocDate)}
                  </div>
                  <div>
                    <strong>Title:</strong> {moc.mocTitle}
                  </div>
                  <div>
                    <strong>Plant:</strong> {moc.mocPlant}
                  </div>
                </div>
              ))
            ) : (
              <p>No MOC details available.</p>
            )}
          </div>
        )}
        {showDocuments && documents.length > 0 && (
          <div>
            <h3>Documents</h3>
            <ul className="document-list">
              {documents.map((doc) => {
                const fileName = doc.filePath.split("\\").pop();
                return (
                  <li key={doc.id}>
                    <a
                      href={`http://${strings.localhost}/api/javaHazopDocument/view/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {fileName || "Unnamed Document"}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="table-section">
        <div className="table-header">
          <h1>Nodes</h1>
          <div className="rightbtn-controls">
            <button
              className="add-btn"
              onClick={() =>
                navigate("/NodeRetrieve", {
                  state: {
                    hazopRegistrationId: hazopData.id,
                  },
                })
              }
            >
              Retrieve Nodes
            </button>
            <button
              type="button"
              className="add-btn"
              onClick={() =>
                navigate("/NodePopup", {
                  state: {
                    hazopData: hazopData,
                    redirectTo: "/hazop-details",
                  },
                })
              }
            >
              + Add Node
            </button>
          </div>
        </div>

        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Node No.</th>
                <th>Registration Date</th>
                <th>Design Intent</th>
                <th>Completion Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
  {nodes.map((n, idx) => (
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
            n.completionStatus ? "status-completed" : "status-pending"
          }
        >
          {n.completionStatus ? "Completed" : "Ongoing"}
        </span>
      </td>

      <td onClick={(e) => e.stopPropagation()}>
        <FaEdit
          title="Update Node"
          style={{ cursor: "pointer", color: "#1976d2" }}
          onClick={() =>
            navigate("/UpdateNode", { state: { nodeId: n.id } })
          }
        />
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default NodePage;
