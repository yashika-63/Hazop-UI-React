import React, { useState, useEffect, useRef } from "react"; // Added useRef
import axios from "axios"; // Import Axios
import { strings } from "../string";
import { formatDate } from "../CommonUI/CommonUI";
import { FaEdit, FaEllipsisV, FaSearch, FaSpinner } from "react-icons/fa"; // Added FaSpinner
import HazopRegistration from "../HazopEntry/HazopRegistration";

const MOCList = () => {
  const empCode = localStorage.getItem("empCode");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // UI States
  const [loading, setLoading] = useState(true);
  const [openHazopPopup, setOpenHazopPopup] = useState(false);
  const [selectedMOC, setSelectedMOC] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [teamSearch, setTeamSearch] = useState("");

  // Ref to track if it is the first page load
  const isFirstRun = useRef(true);

  const createHazopPopup = (item) => {
    setSelectedMOC(item);
    setOpenHazopPopup(true);
  };

  const closeHazopPopup = () => {
    setOpenHazopPopup(false);
    setSelectedMOC(null);
  };

  const handleSaveSuccess = () => {
    closeHazopPopup();
    fetchMOCData(currentPage, teamSearch);
  };

  // --- 1. AXIOS FETCH FUNCTION ---
  const fetchMOCData = async (page = 0, search = "") => {
    setLoading(true); // Start loading
    try {
      const baseUrl = `${strings.localhost}/api/moc`;
      const endpoint = search ? "/search/hazop-yes" : "/hazop-yes";

      const params = {
        page: page,
        size: pageSize,
        ...(search && { keyword: search }), // Only add keyword if search exists
      };

      // Using Axios
      const response = await axios.get(`${baseUrl}${endpoint}`, { params });
      const result = response.data;

      let content = [];
      let pageCount = 0;

      if (search && Array.isArray(result)) {
        // Handle Flat List Search Result
        content = result;
        pageCount = 1;
        setCurrentPage(0);
      } else {
        // Handle Standard Paginated Result
        content = result.data || [];
        pageCount = result.totalPages || 0;
        setCurrentPage(page);
      }

      setData(content);
      setTotalPages(pageCount);
    } catch (error) {
      console.error("Error fetching MOC data:", error);
      setData([]);
    } finally {
      setLoading(false); // Stop loading regardless of success/error
    }
  };

  // --- 2. OPTIMIZED USE EFFECT ---
  useEffect(() => {
    // If it's the very first load, run IMMEDIATELY (no delay)
    if (isFirstRun.current) {
      fetchMOCData(0, teamSearch);
      isFirstRun.current = false; // Mark first run as done
      return;
    }

    // For all subsequent typing, wait 800ms (Debounce)
    const getData = setTimeout(() => {
      fetchMOCData(0, teamSearch);
    }, 800);

    return () => clearTimeout(getData);
  }, [pageSize, teamSearch]);
  // Note: If you want pagination buttons to be instant,
  // you might need a separate useEffect for 'currentPage' changes.

  const handleSearchChange = (e) => {
    setTeamSearch(e.target.value);
    // Note: We let the useEffect handle the fetch to apply debounce
  };

  // Pagination Click Handler
  const handlePageChange = (newPage) => {
    // Fetch immediately on button click (no need to debounce pagination)
    fetchMOCData(newPage, teamSearch);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const renderDropdown = (item) => (
    <div className="dropdown top-header">
      <button
        className="dots-button"
        onClick={() => toggleDropdown(item.MOCID)}
      >
        <FaEllipsisV />
      </button>
      {openDropdown === item.MOCID && (
        <div className="dropdown-content">
          <button onClick={() => createHazopPopup(item)}>
            <FaEdit /> Create Hazop
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1>MOC List</h1>

      {/* SEARCH BAR */}
      <div
        className="search-container"
      >
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search MOC..."
            value={teamSearch}
            onChange={handleSearchChange}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {" "}
        {/* Added wrapper for mobile scroll if needed */}
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>MOC No</th>
              <th>MOC Title</th>
              <th>MOC Date</th>
              <th>Department</th>
              <th>Plant</th>
              <th>Hazop Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* --- 3. LOADING STATE HANDLING --- */}
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="no-data1"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <FaSpinner
                    className="spinner-icon"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  &nbsp; Loading Data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data1">
                  No Data Found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.mocId || index}>
                  <td>{currentPage * pageSize + index + 1}</td>
                  <td>{item.mocNo}</td>
                  <td>{item.mocTitle}</td>
                  <td>{formatDate(item.mocDate)}</td>
                  <td>{item.department}</td>
                  <td>{item.plant}</td>
                  <td>
                    <span
                      className={
                        item.hazopGenerationStatus?.toLowerCase() ===
                        "generated"
                          ? "status-completed"
                          : "status-pending"
                      }
                    >
                      {item.hazopGenerationStatus}
                    </span>
                  </td>
                  <td>{renderDropdown(item)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openHazopPopup && selectedMOC && (
        <div className="modal-overlay">
          <div className="modal-box">
            <HazopRegistration
              closePopup={closeHazopPopup}
              onSaveSuccess={handleSaveSuccess}
              moc={selectedMOC}
            />
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="center-controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || totalPages === 0 || loading}
        >
          Previous
        </button>
        <span className="page-info">
          Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage >= totalPages - 1 || totalPages === 0 || loading
          }
        >
          Next
        </button>
      </div>

      {/* Inline CSS for simple spinner if not in your global css */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MOCList;
