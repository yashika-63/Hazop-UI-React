import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEllipsisV, FaFilePdf, FaHistory, FaLink, FaSearch } from "react-icons/fa";
import HazopReport from "../Reports/HazopReport";
import { strings } from "../string";
import HazopRevision from "./HazopRevision";
import MocPopup from "./MocPopup";

const HazopList = () => {
  const [hazopData, setHazopData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedHazopId, setSelectedHazopId] = useState(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);

  const handleRevisionClick = (id) => {
    setSelectedRevisionId(id);
    setOpenDropdown(null);
  };


  const [openMocPopup, setOpenMocPopup] = useState(false);
  const companyId = localStorage.getItem("companyId");
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  useEffect(() => {
    const fetchHazopData = async () => {
      try {
        const response = await axios.get(
          `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
        );
        setHazopData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching HAZOP data");
        setLoading(false);
      }
    };

    fetchHazopData();
  }, []);

  const truncateDescription = (description) => {
    const words = description.split(" ");
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : description;
  };
  useEffect(() => {
    const fetchHazopData = async () => {
      try {
        const response = await axios.get(
          `http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=true&sendForVerification=false`
        );
        setHazopData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching HAZOP data");
        setLoading(false);
      }
    };
    fetchHazopData();
  }, []);


  const renderDropdown = (item) => (
    <div className="dropdown">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button onClick={() => setSelectedHazopId(item.id)}> <FaFilePdf /> Report</button>

          <button
            onClick={() => {
              setOpenMocPopup(item.id);
              setOpenDropdown(null);
            }}
          >
            <FaLink />  Link MOC
          </button>
          <button type="button" onClick={() => setSelectedRevisionId(item.id)}>
            <FaHistory /> Hazop Revision
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1>HAZOP List</h1>
      <div className="hazoptable-wrapper">
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>HAZOP Date</th>
              <th>Site</th>
              <th>Department</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hazopData.length > 0 ? (
              hazopData.map((hazop) => (
                <tr key={hazop.id}>
                  <td>{hazop.id}</td>
                  <td>{hazop.hazopDate}</td>
                  <td>{hazop.site}</td>
                  <td>{hazop.department}</td>
                  <td>{hazop.status ? "Active" : "Inactive"}</td>
                  <td>{hazop.createdBy || "N/A"}</td>
                  <td>{hazop.createdByEmail}</td>
                  <td>{renderDropdown(hazop)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="no-data">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {selectedHazopId && (
        <HazopReport
          hazopId={selectedHazopId}
          onClose={() => setSelectedHazopId(null)}
        />
      )}

      {selectedRevisionId && (
        <HazopRevision
          hazopId={selectedRevisionId}
          onClose={() => setSelectedRevisionId(null)}
        />
      )}

      {openMocPopup && (
        <MocPopup
          hazopId={openMocPopup}
          onClose={() => setOpenMocPopup(null)}
        />
      )}
    </div>
  );
};

export default HazopList;
