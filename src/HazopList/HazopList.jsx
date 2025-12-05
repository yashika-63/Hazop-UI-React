import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEllipsisV, FaFilePdf, FaHistory, FaLink } from "react-icons/fa";
import HazopReport from "../Reports/HazopReport";
import HazopRevision from "./HazopRevision";
import MocPopup from "./MocPopup";
import { strings } from "../string";

const HazopList = () => {
  const [hazopData, setHazopData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedHazopId, setSelectedHazopId] = useState(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [openMocPopup, setOpenMocPopup] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10); 
  const [totalPages, setTotalPages] = useState(0);

  const companyId = localStorage.getItem("companyId");

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  useEffect(() => {
    fetchPaginatedHazopData();
  }, [page]); 

  const fetchPaginatedHazopData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://${strings.localhost}/api/hazopRegistration/by-company-paginated?companyId=${companyId}&page=${page}&size=${size}`
      );

      setHazopData(response.data.content);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Error fetching paginated HAZOP data");
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const renderDropdown = (item) => (
    <div className="dropdown">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button onClick={() => setSelectedHazopId(item.id)}>
            <FaFilePdf /> Report
          </button>

          <button
            onClick={() => {
              setOpenMocPopup(item.id);
              setOpenDropdown(null);
            }}
          >
            <FaLink /> Link MOC
          </button>

          <button onClick={() => setSelectedRevisionId(item.id)}>
            <FaHistory /> Hazop Revision
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1>HAZOP List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="hazoptable-wrapper">
          <table className="hazoplist-table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Hazop Title</th>
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
                hazopData.map((hazop, index) => (
                  <tr key={hazop.id}>
                    <td>{page * size + index + 1}</td>
                    <td>{hazop.hazopTitle || "-"}</td>
                    <td>{hazop.hazopDate || "-"}</td>
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
                  <td colSpan="9" className="no-data">No Data Found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION CONTROLS */}
          <div className="center-controls">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className="pagination-btn"
            >
              Previous
            </button>

            <span className="page-info">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={page === totalPages - 1}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* POPUPS */}
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
