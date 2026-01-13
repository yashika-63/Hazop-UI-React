import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  FaEllipsisV,
  FaFilePdf,
  FaHistory,
  FaLink,
  FaSearch,
} from "react-icons/fa";
import HazopReport from "../Reports/HazopReport";
import HazopRevision from "./HazopRevision";
import { strings } from "../string";
import {
  fetchDataByKey,
  formatDate,
  truncateWords,
  showToast,
  fetchDepartmentsBySite,
} from "../CommonUI/CommonUI";
import MocPopup from "../MOC/MocPopup";
import _ from "lodash";

const HazopList = () => {
  const [hazopData, setHazopData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedHazopId, setSelectedHazopId] = useState(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [openMocPopup, setOpenMocPopup] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    status: "",
    department: "",
    site: "",
  });

  // --- Search States ---
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  // --- Sorting State ---
  const [sortOrder, setSortOrder] = useState("desc");

  // --- Options States ---
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

  // Refs to handle request cancellation
  const abortControllerRef = useRef(null);

  const companyId = localStorage.getItem("companyId") || 1;

  // =============================================
  // 4. MAIN DATA FETCHING (Optimized)
  // =============================================
  const fetchHazopData = useCallback(async () => {
    // 1. Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // 2. Create new controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      let url = "";
      const isSearching = debouncedSearch.length > 0;

      // --- SCENARIO A: SEARCHING ---
      if (isSearching) {
        url = `${
          strings.localhost
        }/api/moc-reference/search-hazop?search=${encodeURIComponent(
          debouncedSearch
        )}`;
      }
      // --- SCENARIO B: PAGINATION & FILTERING ---
      else {
        const params = new URLSearchParams();
        params.append("companyId", companyId);
        params.append("page", page);
        params.append("size", size);
        params.append("sort", `hazopDate,${sortOrder}`);

        if (filters.status) params.append("status", filters.status);
        if (filters.department) params.append("department", filters.department);
        if (filters.site) params.append("site", filters.site);

        url = `${
          strings.localhost
        }/api/hazopRegistration/by-company-paginated?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });

      // --- DATA MAPPING ---
      let content = [];
      if (isSearching) {
        content = response.data || [];
        content.sort((a, b) => {
          const dateA = new Date(a.hazopDate);
          const dateB = new Date(b.hazopDate);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        setTotalPages(1);
      } else {
        content = response.data.content || [];
        setTotalPages(response.data.totalPages || 0);
      }

      setHazopData(content);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
      } else {
        console.error("Fetch Error:", err);
        showToast("Error fetching data", "error");
        setHazopData([]);
      }
    } finally {
      if (
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, page, size, sortOrder, filters, companyId]);

  // =============================================
  // 1. INITIAL LOAD: Fetch Sites
  // =============================================
 
    const loadSites = async () => {
      // Small delay to allow the Main Table Request to fly out first
      setTimeout(async () => {
        try {
          const siteData = await fetchDataByKey("Site");
          setSiteOptions(siteData || []);
        } catch (err) {
          console.error("Error loading sites", err);
        }
      }, 100);
    };

  // =============================================
  // 2. FILTER LOGIC: Fetch Departments when Site Changes
  // =============================================
  useEffect(() => {
    if (filters.site) {
      fetchDepartmentsBySite(filters.site, setDepartmentOptions);
    } else {
      setDepartmentOptions([]);
    }
  }, [filters.site]);

  // =============================================
  // 3. DEBOUNCE SEARCH LOGIC
  // =============================================
  // This effect waits 500ms after user stops typing to update 'debouncedSearch'
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      if (searchText !== debouncedSearch) setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchHazopData();
  }, [fetchHazopData]);
  useEffect(() => {
    loadSites();
  }, []);
  // =============================================
  // 5. OPTIMIZED EVENT HANDLERS
  // =============================================

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === "site") {
        newFilters.department = "";
      }
      return newFilters;
    });
    setPage(0);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleSortClick = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.site}
            onChange={(e) => handleFilterChange("site", e.target.value)}
            className="filter-select"
          >
            <option value="">All Sites</option>
            {siteOptions.map((opt, index) => (
              <option key={opt.id || index} value={opt.data}>
                {opt.data}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="filter-select"
            disabled={!filters.site}
            style={{
              cursor: !filters.site ? "not-allowed" : "pointer",
              opacity: !filters.site ? 0.6 : 1,
            }}
          >
            <option value="">All Departments</option>
            {departmentOptions.map((opt, index) => (
              <option key={opt.id || index} value={opt.data}>
                {opt.data}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="hazoplist-table">
          <thead>
            <tr>
              <th>Hazop ID</th>
              <th>Hazop Title</th>
              <th
                onClick={handleSortClick}
                style={{ cursor: "pointer", userSelect: "none" }}
                title={`Sort by Date: ${
                  sortOrder === "asc" ? "Oldest First" : "Newest First"
                }`}
              >
                Hazop Date {sortOrder === "asc" ? "↑↓" : "↓↑"}
              </th>
              <th>Site</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="loading-spinner-small"></div> Loading data...
                </td>
              </tr>
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
                    <span
                      className={
                        hazop.status ? "status-active" : "status-inactive"
                      }
                    >
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

        {!debouncedSearch && (
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
