import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEllipsisV, FaFilePdf, FaHistory, FaLink, FaSearch } from "react-icons/fa";
import HazopReport from "../Reports/HazopReport";
import HazopRevision from "./HazopRevision";
import { strings } from "../string";
import { truncateWords } from "../CommonUI/CommonUI";
import MocPopup from "../MOC/MocPopup";

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

  const [searchText, setSearchText] = useState(""); // new search state

  const companyId = localStorage.getItem("companyId");

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // === FETCH DATA ===
  const fetchHazopData = async (page = 0, search = "") => {
    try {
      setLoading(true);
      const url = search
        ? `http://${strings.localhost}/api/moc-reference/search-hazop?search=${search}`
        : `http://${strings.localhost}/api/hazopRegistration/by-company-paginated?companyId=${companyId}&page=${page}&size=${size}`;

      const response = await axios.get(url);
      const content = response.data.content || response.data || [];

      setHazopData(content);
      setTotalPages(response.data.totalPages || 1);
      if (content.length === 0) setPage(0);
      setLoading(false);
    } catch (err) {
      setError("Error fetching HAZOP data");
      setHazopData([]);
      setPage(0);
      setTotalPages(0);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHazopData(page, searchText);
  }, [page, searchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(0); // reset page when searching
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

      {/* SEARCH BAR */}
      <div className="search-container" style={{ marginBottom: "10px", float: "right" }}>
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search HAZOP..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>


      <div>
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Hazop Title</th>
              <th>HAZOP Date</th>
              <th>Site</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {hazopData.length > 0 ? (
              hazopData.map((hazop, index) => (
                <tr key={hazop.id || index}>
                  <td>{page * size + index + 1}</td>
                  <td>{truncateWords(hazop.hazopTitle || "-")}</td>
                  <td>{hazop.hazopDate || "-"}</td>
                  <td>{hazop.site || "-"}</td>
                  <td>{hazop.department || "-"}</td>
                  <td>
                    <span className={hazop.status ? "status-active" : "status-inactive"}>
                      {hazop.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{renderDropdown(hazop)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS */}
        <div className="center-controls">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={page === 0 || hazopData.length === 0}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="page-info">
            Page {hazopData.length === 0 ? 0 : page + 1} of {hazopData.length === 0 ? 0 : totalPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || hazopData.length === 0}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>


      {/* POPUPS */}
      {selectedHazopId && (
        <HazopReport hazopId={selectedHazopId} onClose={() => setSelectedHazopId(null)} />
      )}

      {selectedRevisionId && (
        <HazopRevision hazopId={selectedRevisionId} onClose={() => setSelectedRevisionId(null)} />
      )}

      {openMocPopup && <MocPopup hazopId={openMocPopup} onClose={() => setOpenMocPopup(null)} />}
    </div>
  );
};

export default HazopList;
