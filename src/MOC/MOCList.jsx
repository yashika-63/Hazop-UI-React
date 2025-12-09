import React, { useState, useEffect } from "react";
import { strings } from "../string";
import { formatDate } from "../CommonUI/CommonUI";
import { FaEdit, FaEllipsisV, FaSearch } from "react-icons/fa";
import HazopRegistration from "../HazopEntry/HazopRegistration";

const MOCList = () => {
    const empCode = localStorage.getItem("empCode");
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [openHazopPopup, setOpenHazopPopup] = useState(false);
    const [selectedMOC, setSelectedMOC] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [teamSearch, setTeamSearch] = useState(""); // search text

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
        fetchMOCData(currentPage);
    };

    const fetchMOCData = async (page = 0, search = "") => {
        setLoading(true);
        try {
            const url = search
                ? `http://${strings.localhost}/api/moc/search/hazop-yes?keyword=${search}`
                : `http://${strings.localhost}/api/moc/hazop-yes?page=${page}&size=${pageSize}`;

            const response = await fetch(url);
            const result = await response.json();

            // For search API, result is directly an array
            const content = Array.isArray(result) ? result : result.data || [];

            // Set pagination values if available
            if (!search) {
                setCurrentPage(result.currentPage > 0 ? result.currentPage - 1 : 0);
                setTotalPages(result.totalPages || 0);
            } else {
                setCurrentPage(0); // or result.currentPage if your search API returns it
                setTotalPages(1);  // or result.totalPages if your search API returns it
            }

            setData(content);
        } catch (error) {
            console.error("Error fetching MOC data:", error);
            setData([]);
            setCurrentPage(0);
            setTotalPages(0);
        }
        setLoading(false);
    };


    useEffect(() => {
        fetchMOCData(0, teamSearch); // fetch data with search text
    }, [pageSize, teamSearch]);

    const handleSearchChange = (e) => {
        setTeamSearch(e.target.value);
        setCurrentPage(0); // reset to first page for new search
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const renderDropdown = (item) => (
        <div className="dropdown top-header">
            <button className="dots-button" onClick={() => toggleDropdown(item.MOCID)}>
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
        <div >
            <h1>MOC List</h1>

            {/* SEARCH BAR */}
            <div className="search-container" style={{ float: "right", marginBottom: "10px" }}>
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
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>MOC No</th>
                        <th>MOC Title</th>
                        <th>Department</th>
                        <th>Plant</th>
                        <th>MOC Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data1">
                                No Data Found
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.MOCID || index}>
                                <td>{currentPage * pageSize + index + 1}</td>
                                <td>{item.MocNo}</td>
                                <td>{item.MOCTitle}</td>
                                <td>{item.Department}</td>
                                <td>{item.Plant}</td>
                                <td>{formatDate(item.MOCDate)}</td>
                                <td>{renderDropdown(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

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
                    onClick={() => currentPage > 0 && fetchMOCData(currentPage - 1, teamSearch)}
                    disabled={currentPage === 0 || totalPages === 0}
                >
                    Previous
                </button>
                <span className="page-info">
                    Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
                </span>
                <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => currentPage < totalPages - 1 && fetchMOCData(currentPage + 1, teamSearch)}
                    disabled={currentPage >= totalPages - 1 || totalPages === 0}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default MOCList;
