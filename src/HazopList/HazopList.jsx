import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEllipsisV,
  FaFilePdf,
  FaHistory,
  FaLink,
  FaSearch
} from "react-icons/fa";
import HazopReport from "../Reports/HazopReport";
import HazopRevision from "./HazopRevision";
import { strings } from "../string";
import { fetchDataByKey, fetchSitesByDepartment, formatDate, truncateWords, showToast } from "../CommonUI/CommonUI";
import MocPopup from "../MOC/MocPopup";

const HazopList = () => {
  // --- Data States ---
  const [hazopData, setHazopData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Dropdown / Popup States ---
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedHazopId, setSelectedHazopId] = useState(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [openMocPopup, setOpenMocPopup] = useState(false);

  // --- Pagination States ---
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // --- Filter States ---
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");

  // --- Sorting State ---
  const [sortOrder, setSortOrder] = useState("desc");

  // --- Filter Options States ---
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

  // Get Company ID (assuming stored in local storage)
  const companyId = localStorage.getItem("companyId") || 1; 

  // =============================================
  // 1. INITIAL LOAD: Fetch Departments for Filter
  // =============================================
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deptData = await fetchDataByKey("department");
        setDepartmentOptions(deptData || []);
      } catch (err) {
        console.error("Error loading departments", err);
      }
    };
    loadDepartments();
  }, []);

  // =============================================
  // 2. FILTER LOGIC: Fetch Sites when Dept Changes
  // =============================================
  useEffect(() => {
    if (departmentFilter) {
      fetchSitesByDepartment(departmentFilter, setSiteOptions);
    } else {
      setSiteOptions([]);
      setSiteFilter("");
    }
  }, [departmentFilter]);

  // =============================================
  // 3. MAIN DATA FETCHING
  // =============================================
  const fetchHazopData = async () => {
    try {
      setLoading(true);
      let url = "";
      const isSearching = searchText.length > 0;

      // --- SCENARIO A: SEARCHING ---
      if (isSearching) {
        // Search API usually returns a flat array: [...]
        url = `http://${strings.localhost}/api/moc-reference/search-hazop?search=${encodeURIComponent(searchText)}`;
      } 
      // --- SCENARIO B: PAGINATION & FILTERING ---
      else {
        // Paginated API returns object: { content: [...], totalPages: X }
        const params = new URLSearchParams();
        params.append("companyId", companyId);
        params.append("page", page);
        params.append("size", size);
        params.append("sort", `hazopDate,${sortOrder}`); // Server-side sorting

        // Append Filters if they exist
        if (statusFilter) params.append("status", statusFilter);
        if (departmentFilter) params.append("department", departmentFilter);
        if (siteFilter) params.append("site", siteFilter);

        url = `http://${strings.localhost}/api/hazopRegistration/by-company-paginated?${params.toString()}`;
      }

      const response = await axios.get(url);

      // --- DATA MAPPING LOGIC ---
      let content = [];
      
      if (isSearching) {
        // Search API returns direct array
        content = response.data || [];
        
        // Search API often doesn't support server-side sort, so we sort client-side here
        content.sort((a, b) => {
            const dateA = new Date(a.hazopDate);
            const dateB = new Date(b.hazopDate);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        // Hide pagination controls when searching
        setTotalPages(1); 
      } else {
        // Paginated API returns { content: [...] }
        content = response.data.content || [];
        setTotalPages(response.data.totalPages || 0);
      }

      setHazopData(content);

    } catch (err) {
      console.error("Fetch Error:", err);
      showToast("Error fetching data", "error");
      setHazopData([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when any dependency changes
  useEffect(() => {
    fetchHazopData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchText, statusFilter, departmentFilter, siteFilter, sortOrder]);


  // =============================================
  // 4. EVENT HANDLERS
  // =============================================
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(0); // Reset page on search
  };

  // !!! CRITICAL: Reset Page to 0 when filters change !!!
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); 
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setPage(0);
  };

  const handleSiteChange = (e) => {
    setSiteFilter(e.target.value);
    setPage(0);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleSortClick = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const handlePrevPage = () => { if (page > 0) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

  // --- Render Dropdown ---
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
          <button onClick={() => { setOpenMocPopup(item.id); setOpenDropdown(null); }}>
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
      {/* --- HEADER & SEARCH --- */}
      <div>
        <h1>HAZOP List</h1>
        <div className="search-container">
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search by Title..."
              value={searchText}
              onChange={handleSearchChange}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {/* --- FILTERS SECTION --- */}
      <div className="filters-container">
        
        {/* Status Filter */}
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={handleStatusChange} // Uses handler that resets page
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={handleDepartmentChange} // Uses handler that resets page
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((opt) => (
              <option key={opt.id} value={opt.data}>{opt.data}</option>
            ))}
          </select>
        </div>

        {/* Site Filter */}
        <div className="filter-group">
          <select
            value={siteFilter}
            onChange={handleSiteChange} // Uses handler that resets page
            className="filter-select"
            disabled={!departmentFilter}
            style={{ cursor: !departmentFilter ? "not-allowed" : "pointer", opacity: !departmentFilter ? 0.6 : 1 }}
          >
            <option value="">All Sites</option>
            {siteOptions.map((opt) => (
              <option key={opt.id} value={opt.data}>{opt.data}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="table-responsive">
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Hazop ID</th>
              <th>Hazop Title</th>
              
              {/* Sortable Header */}
              <th
                onClick={handleSortClick}
                style={{ cursor: "pointer", userSelect: "none" }}
                title={`Sort by Date: ${sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}`}
              >
                  Hazop Date {sortOrder === 'asc' ? "↑↓" : "↓↑"}
              </th>

              <th>Site</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center">Loading data...</td></tr>
            ) : hazopData.length > 0 ? (
              hazopData.map((hazop) => (
                <tr key={hazop.id}>
                  <td>{hazop.id}</td>
                  <td title={hazop.hazopTitle}>
                    {truncateWords(hazop.hazopTitle || "-", 6)}
                  </td>
                  <td>{formatDate(hazop.hazopDate) || "-"}</td>
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
                  No Data Found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* --- PAGINATION (Only show if NOT searching) --- */}
        {!searchText && (
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
              Page {hazopData.length === 0 ? 0 : page + 1} of {totalPages}
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
        )}
      </div>

      {/* --- POPUPS --- */}
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