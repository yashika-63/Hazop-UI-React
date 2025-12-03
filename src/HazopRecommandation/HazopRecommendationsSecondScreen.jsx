// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { strings } from "../string";
// import { showToast, formatDate } from "../CommonUI/CommonUI";

// const HazopRecommendationsSecondScreen = ({ hazopId }) => {
//     const [data, setData] = useState({
//         rejected: [],
//         accepted: [],
//         assigned: [],
//         notAssigned: [],
//     });

//     const [loading, setLoading] = useState(true);

//     const fetchData = async () => {
//         try {
//             const res = await axios.get(
//                 `http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`
//             );

//             setData({
//                 rejected: res.data.rejected ?? [],
//                 accepted: res.data.accepted ?? [],
//                 assigned: res.data.assigned ?? [],
//                 notAssigned: res.data.notAssigned ?? [],
//             });

//         } catch (error) {
//             console.error("API Error:", error);
//             showToast("Failed to fetch records", "error");
//             setData({
//                 rejected: [],
//                 accepted: [],
//                 assigned: [],
//                 notAssigned: [],
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (hazopId) fetchData();
//     }, [hazopId]);

//     // Reusable table renderer
//     const renderTable = (title, list, columns) => (
//         <div className="section-block">
//             <h3 className="section-title">{title}</h3>

//             {list.length === 0 ? (
//                 <p className="no-data1">No Data Available</p>
//             ) : (
//                 <table className="recommandation-table">
//                     <thead>
//                         <tr>
//                             {columns.map((col, i) => (
//                                 <th key={i}>{col.header}</th>
//                             ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {list.map((item) => (
//                             <tr key={item.id}>
//                                 {columns.map((col, i) => {
//                                     let value;

//                                     // Check if field is inside javaHazopNodeRecommendation
//                                     if (
//                                         item.javaHazopNodeRecommendation &&
//                                         col.fromRecommendation
//                                     ) {
//                                         value =
//                                             item.javaHazopNodeRecommendation[
//                                                 col.field
//                                             ];
//                                     } else {
//                                         value = item[col.field];
//                                     }

//                                     // Format date fields
//                                     if (value && col.field.toLowerCase().includes("date")) {
//                                         value = formatDate(value);
//                                     }

//                                     return <td key={i}>{value ?? "-"}</td>;
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );

//     const notAssignedCols = [
//         { header: "ID", field: "id" },
//         { header: "Recommendation", field: "recommendation", fromRecommendation: true },
//         { header: "Remark", field: "remarkbyManagement", fromRecommendation: true },
//         { header: "Verification By", field: "verificationResponsibleEmployeeName", fromRecommendation: true },
//         { header: "Verification Date", field: "verificationDate", fromRecommendation: true },
//     ];

//     const assignedCols = [
//         { header: "ID", field: "id" },
//         { header: "Assigned To", field: "assignToEmpCode" },
//         { header: "Assigned Date", field: "assignWorkDate" },
//         { header: "Created By", field: "createdByName" },
//         { header: "Recommendation", field: "recommendation", fromRecommendation: true },
//     ];

//     const acceptedCols = [
//         { header: "ID", field: "id" },
//         { header: "Assigned To", field: "assignToEmpCode" },
//         { header: "Accepted By", field: "acceptedByEmployeeName" },
//         { header: "Accepted Email", field: "acceptedByEmployeeEmail" },
//         { header: "Assign Date", field: "assignWorkDate" },
//         { header: "Recommendation", field: "recommendation", fromRecommendation: true },
//     ];

//     const rejectedCols = [
//         { header: "ID", field: "id" },
//         { header: "Assigned To", field: "assignToEmpCode" },
//         { header: "Rejected By", field: "acceptedByEmployeeName" },
//         { header: "Rejected Email", field: "acceptedByEmployeeEmail" },
//         { header: "Assign Date", field: "assignWorkDate" },
//         { header: "Recommendation", field: "recommendation", fromRecommendation: true },
//     ];

//     return (
//         <div className="second-screen-container">
//             {loading ? (
//                 <p className="loading">Loading...</p>
//             ) : (
//                 <>
//                     {renderTable("Not Assigned", data.notAssigned, notAssignedCols)}
//                     {renderTable("Assigned", data.assigned, assignedCols)}
//                     {renderTable("Accepted", data.accepted, acceptedCols)}
//                     {renderTable("Rejected", data.rejected, rejectedCols)}
//                 </>
//             )}
//         </div>
//     );
// };

// export default HazopRecommendationsSecondScreen;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { showToast, formatDate } from "../CommonUI/CommonUI";
import { FaEdit, FaEllipsisV, FaSearch, FaUserPlus } from "react-icons/fa";
import '../styles/global.css';

const HazopRecommendationsSecondScreen = ({ hazopId }) => {
    const [data, setData] = useState({
        rejected: [],
        accepted: [],
        assigned: [],
        notAssigned: [],
    });

    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [assignPopupOpen, setAssignPopupOpen] = useState(false);
    const [selectedHazop, setSelectedHazop] = useState(null);
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [assignLoading, setAssignLoading] = useState(false);
    const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);


    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };


    const openUpdatePopup = (item) => {
        setSelectedHazop(item);
        setAssignPopupOpen(true);
        setTeamSearch("");
        setSearchResults([]);
        setSelectedEmployee(null);
    };

    const handleAssignClick = () => {
        if (!selectedEmployee || !selectedHazop) {
            showToast("Select an employee first", "warning");
            return;
        }
        setConfirmPopupOpen(true);
    };

    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);

        if (value.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(response.data || []);
        } catch (err) {
            console.error("Team search failed:", err);
            showToast("Failed to fetch employees", "error");
        }
    };

    const addTeamMember = (user) => {
        setSelectedEmployee(user);
        setSearchResults([]);
        setTeamSearch(`${user.empCode}`);
    };
    const handleConfirmAssign = async () => {
        setConfirmPopupOpen(false);
        setAssignLoading(true);
        console.log('selectedHazopid', selectedHazop.id || 'NA');

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/save`,
                null, // no request body
                {
                    params: {
                        recommendationId: selectedHazop.id,
                        createdByEmpCode: selectedEmployee.empCode,
                        assignToEmpCode: selectedEmployee.empCode,
                        assignWorkDate: new Date().toISOString().split("T")[0]
                    }
                }
            );

            showToast(response.data.message || "Employee assigned successfully!", "success");
            fetchData();
            setAssignPopupOpen(false);
        } catch (err) {
            console.error("Assign failed:", err);
            showToast("Failed to assign employee", "error");
        } finally {
            setAssignLoading(false);
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



    const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">
                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button type="button" onClick={onCancel} className="cancel-btn">No</button>
                        <button type="button" onClick={onConfirm} className="confirm-btn">Yes</button>
                    </div>
                </div>
            </div>
        );
    };



    const renderDropdown = (item) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button onClick={() => openUpdatePopup(item)}>
                        <FaUserPlus /> Assign Employee
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="second-screen-container">

            {/* Not Assigned */}
            <div className="section-block">
                <h5>Not Assigned</h5>
                <table className="recommendation-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Recommendation</th>
                            <th>Remark</th>
                            <th>Verification By</th>
                            <th>Verification Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.notAssigned.length === 0 ? (
                            <td colSpan='6' className="no-data1">No data available</td>
                        ) : (
                            data.notAssigned.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.recommendation ?? "-"}</td>
                                    <td>{item.remarkbyManagement ?? "-"}</td>
                                    <td>{item.verificationResponsibleEmployeeName ?? "-"}</td>
                                    <td>{item.verificationDate ? formatDate(item.verificationDate) : "-"}</td>
                                    <td>{renderDropdown(item)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            </div>

            {/* Assigned */}
            <div className="section-block">
                <h5>Assigned</h5>

                <table className="recommendation-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Recommendation</th>
                            <th>Remark </th>
                            <th>Created By</th>
                            <th>Assigned To</th>
                            <th>Assigned Date</th>


                        </tr>
                    </thead>
                    <tbody>
                        {data.assigned.length === 0 ? (
                            <td colSpan='6' className="no-data1">No Data Available</td>
                        ) : (

                            data.assigned.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.javaHazopNodeRecommendation?.recommendation ?? "-"}</td>
                                    <td>{item.javaHazopNodeRecommendation?.remarkbyManagement ?? "-"}</td>
                                    <td>{item.createdByName || '-'}</td>
                                    <td>{item.assignToEmpCode || '-'}</td>
                                    <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>


                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            </div>

            {/* Accepted */}
            <div className="section-block">
                <h5>Accepted</h5>

                <table className="recommendation-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Recommendation</th>
                            <th>Remark </th>
                            <th>Created By</th>
                            <th>Assigned To</th>
                            <th>Accepted By</th>
                            <th>Assign Date</th>

                        </tr>
                    </thead>
                    <tbody>
                        {data.accepted.length === 0 ? (
                            <td colSpan="6" className="no-data1">No Data Available</td>
                        ) : (
                            data.accepted.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.javaHazopNodeRecommendation?.recommendation ?? "-"}</td>
                                    <td>{item.javaHazopNodeRecommendation?.remarkbyManagement ?? "-"}</td>
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

            {/* Rejected */}
            <div className="section-block">
                <h5>Rejected</h5>

                <table className="recommendation-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Recommendation</th>
                            <th>Remark </th>
                            <th>Created By</th>
                            <th>Assigned To</th>
                            <th>Rejected By</th>
                            <th>Assign Date</th>

                        </tr>
                    </thead>
                    <tbody>
                        {data.rejected.length === 0 ? (
                            <td colSpan="6" className="no-data1">No Data Available</td>
                        ) : (
                            data.rejected.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.javaHazopNodeRecommendation?.recommendation ?? "-"}</td>
                                    <td>{item.javaHazopNodeRecommendation?.remarkbyManagement ?? "-"}</td>
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
            {/* Assign Employee Popup */}
            {assignPopupOpen && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h3 className="centerText">Assign Employee</h3>


                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange}
                                    disabled={loading}
                                />
                                <FaSearch className="search-icon" />


                                <ul className="search-results">
                                    {searchResults.map((emp) => (
                                        <li
                                            key={emp.empCode}
                                            onClick={() => addTeamMember(emp)}
                                            className={selectedEmployee?.empCode === emp.empCode ? "selected" : ""}
                                        >
                                            {emp.empCode} -({emp.emailId || 'NA'})({emp.department || 'NA'})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* Selected Employee Details */}
                        {selectedEmployee && (
                            <div className="details-container">
                                <h5>Selected Employee</h5>
                                <div className="details-row">
                                    <span className="label">Name:</span>
                                    <span className="value">{selectedEmployee.empCode}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Email:</span>
                                    <span className="value">{selectedEmployee.emailId}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Employee Code:</span>
                                    <span className="value">{selectedEmployee.empCode}</span>
                                </div>
                            </div>
                        )}
                        <div className="confirm-buttons">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setAssignPopupOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="confirm-btn"
                                disabled={!selectedEmployee || assignLoading}
                                onClick={handleAssignClick}
                            >{assignLoading ? (
                                <>
                                    <span className="spinner"></span>  {assignLoading ? "Assigning..." : "Assign"}
                                </>
                            ) : (
                                "Assign"
                            )}
                            </button>


                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Popup */}
            {confirmPopupOpen && (
                <ConfirmationPopup
                    message={`Are you sure you want to assign Hazop ID ${selectedHazop.id} to ${selectedEmployee.empCode}?`}
                    onConfirm={handleConfirmAssign}
                    onCancel={() => setConfirmPopupOpen(false)}
                />
            )}


        </div>
    );
};

export default HazopRecommendationsSecondScreen;
