
import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { showToast, formatDate, truncateWords, truncateText } from "../CommonUI/CommonUI";
import { FaEdit, FaEllipsisV, FaSearch, FaUserPlus } from "react-icons/fa";
import '../styles/global.css';
import { useNavigate } from "react-router-dom";

const HazopRecommendationsSecondScreen = ({ hazopId }) => {
    const [data, setData] = useState({
        rejected: [],
        accepted: [],
        assigned: [],
        notAssigned: [],
    });

    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchInputs, setSearchInputs] = useState({});
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [assigningIds, setAssigningIds] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const navigate = useNavigate();
    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };
    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation();

        const targetNodeId = rec.javaHazopNode?.id;
        const targetDetailId = rec.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: {
                    nodeId: targetNodeId,      // Matches ViewNodeDiscussion destructuring
                    detailId: targetDetailId   // Matches ViewNodeDiscussion destructuring
                }
            });
        } else {
            console.error("Missing IDs:", { targetNodeId, targetDetailId });
            showToast("Navigation details missing", "error");
        }
    };

    const openUpdatePopup = (item) => {
        setSelectedHazop(item);
        setAssignPopupOpen(true);
        setTeamSearch("");
        setSearchResults([]);
    };

    const handleSearchChange = async (recId, value) => {
        setSearchInputs(prev => ({ ...prev, [recId]: value }));
        setSelectedEmployees(prev => ({ ...prev, [recId]: null }));

        if (value.length < 2) {
            setSearchResults(prev => ({ ...prev, [recId]: [] }));
            return;
        }

        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(prev => ({ ...prev, [recId]: res.data || [] }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectEmployee = (recId, emp) => {
        setSelectedEmployees(prev => ({ ...prev, [recId]: emp }));
        setSearchInputs(prev => ({ ...prev, [recId]: emp.empCode }));
        setSearchResults(prev => ({ ...prev, [recId]: [] }));
    };

    const handleAssign = async (recId) => {
        const employee = selectedEmployees[recId];
        if (!employee) return;

        setAssigningIds(prev => [...prev, recId]);

        try {
            await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/save`,
                null,
                {
                    params: {
                        recommendationId: recId,
                        createdByEmpCode: employee.empCode,
                        assignToEmpCode: employee.empCode,
                        assignWorkDate: new Date().toISOString().split("T")[0]
                    }
                }
            );

            showToast("Employee assigned successfully!", "success");
            fetchData();
        } catch (err) {
            console.error(err);
            showToast("Failed to assign employee", "error");
        } finally {
            setAssigningIds(prev => prev.filter(id => id !== recId));
            setSelectedEmployees(prev => ({ ...prev, [recId]: null }));
            setSearchInputs(prev => ({ ...prev, [recId]: "" }));
        }
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`
            );

            setData({
                rejected: res.data.rejected ?? [],
                accepted: res.data.accepted ?? [],
                assigned: res.data.assigned ?? [],
                notAssigned: res.data.notAssigned ?? [],
            });

        } catch (error) {
            console.error("API Error:", error);
            showToast("Failed to fetch records", "error");
            setData({
                rejected: [],
                accepted: [],
                assigned: [],
                notAssigned: [],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hazopId) fetchData();
    }, [hazopId]);

    if (loading) return <p className="loading">Loading...</p>;

    return (
        <div>

            {/* Not Assigned */}
            {data.notAssigned.length > 0 && (
                <div className="assigned-table-wrapper not-assigned">
                    <h5>Not Assigned</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Node Reference No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                {/* <th>Reviewed By</th>
                                <th>Reviewed Date</th> */}
                                <th>Assign Employee</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.notAssigned.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data1">No data found</td>
                                </tr>
                            ) : (
                                data.notAssigned.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={expandedRowId === item.id ? "expanded-row" : ""}
                                        onClick={() => toggleRow(item.id)}
                                    >
                                        <td className="sr-no">{index + 1}</td>
                                        <td>
                                            {item.javaHazopNode?.nodeNumber && item.javaHazopNodeDetail?.nodeDetailNumber
                                                ? `${item.javaHazopNode.nodeNumber}.${item.javaHazopNodeDetail.nodeDetailNumber}`
                                                : '-'}
                                        </td>
                                        {/* <td className="sr-no">{item.javaHazopNode?.nodeNumber}</td> */}

                                        {/* 4. Clickable Deviation Cell */}
                                        <td
                                            className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}
                                            onClick={(e) => handleNavigateToDetail(e, item)}
                                            style={{ cursor: 'pointer', color: '#319795', fontWeight: '600' }}
                                            title="Click to view discussion details"
                                        >
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeDetail?.deviation
                                                : truncateText(item.javaHazopNodeDetail?.deviation, 50)}
                                        </td>

                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.recommendation
                                                : truncateText(item.recommendation, 50)}
                                        </td>

                                        <td className="assign-employee">
                                            <div className="search-bar-table" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    placeholder="Search employee..."
                                                    value={searchInputs[item.id] || ""}
                                                    onChange={e => handleSearchChange(item.id, e.target.value)}
                                                />
                                                <FaSearch className="search-icon-table" />
                                                {searchResults[item.id]?.length > 0 && (
                                                    <ul className="search-results-table">
                                                        {searchResults[item.id].map(emp => (
                                                            <li
                                                                key={emp.empCode}
                                                                onClick={() => handleSelectEmployee(item.id, emp)}
                                                            >
                                                                {emp.empCode} - ({emp.emailId || 'NA'})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <button
                                                className="confirm-btn"
                                                onClick={(e) => { e.stopPropagation(); handleAssign(item.id); }}
                                                disabled={!selectedEmployees[item.id] || assigningIds.includes(item.id)}
                                                title={!selectedEmployees[item.id] ? "Select employee first" : ""}
                                            >
                                                {assigningIds.includes(item.id) ? "Assigning..." : "Assign"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Assigned */}
            {data.assigned.length > 0 && (
                <div className="assigned-table-wrapper assigned">
                    <h5>Assigned</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Node Reference No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Created By</th>
                                <th>Assigned To</th>
                                <th>Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.assigned.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data1">No data found</td>
                                </tr>
                            ) : (
                                data.assigned.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={expandedRowId === item.id ? "expanded-row" : ""}
                                        onClick={() => toggleRow(item.id)}
                                    >
                                        <td>{index + 1}</td>

                                        <td className="sr-no">{item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber}</td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation
                                                : truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 50)}
                                        </td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.recommendation ?? "-"
                                                : truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 50)}
                                        </td>
                                        <td>{item.createdByName || '-'}</td>
                                        <td>{item.assignToEmpCode || '-'}</td>
                                        <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Accepted */}
            {data.accepted.length > 0 && (
                <div className="assigned-table-wrapper accepted">
                    <h5>Accepted</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Node Reference No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Created By</th>
                                <th>Assigned To</th>
                                <th>Accepted By</th>
                                <th>Assign Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.accepted.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data1">No data found</td>
                                </tr>
                            ) : (
                                data.accepted.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={expandedRowId === item.id ? "expanded-row" : ""}
                                        onClick={() => toggleRow(item.id)}
                                    >
                                        <td>{index + 1}</td>
                                        <td className="sr-no">{item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber}</td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation
                                                : truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 50)}
                                        </td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.recommendation ?? "-"
                                                : truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 50)}
                                        </td>
                                        <td>{item.createdByName || '-'}</td>
                                        <td>{item.assignToEmpCode}</td>
                                        <td>{item.acceptedByEmployeeName}</td>
                                        <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Rejected */}
            {data.rejected.length > 0 && (
                <div className="assigned-table-wrapper rejected">
                    <h5>Rejected</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Node Reference No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Created By</th>
                                <th>Assigned To</th>
                                <th>Rejected By</th>
                                <th>Assign Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rejected.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data1">No data found</td>
                                </tr>
                            ) : (
                                data.rejected.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={expandedRowId === item.id ? "expanded-row" : ""}
                                        onClick={() => toggleRow(item.id)}
                                    >
                                        <td>{index + 1}</td>

                                        <td className="sr-no">{item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber}</td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation
                                                : truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 50)}
                                        </td>
                                        <td className={`truncate-cell ${expandedRowId === item.id ? "expanded-cell" : ""}`}>
                                            {expandedRowId === item.id
                                                ? item.javaHazopNodeRecommendation?.recommendation ?? "-"
                                                : truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 50)}
                                        </td>
                                        <td>{item.createdByName || '-'}</td>
                                        <td>{item.assignToEmpCode}</td>
                                        <td>{item.acceptedByEmployeeName}</td>
                                        <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            )}



        </div>
    );
};

export default HazopRecommendationsSecondScreen;
