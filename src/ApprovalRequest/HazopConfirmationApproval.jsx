import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDate } from "../CommonUI/CommonUI";
import { FaEllipsisV, FaEye ,FaTimes} from "react-icons/fa";
import CompleteHazopView from "../HazopList/CompleteHazopView";
import { strings } from "../string";

const HazopConfirmationApproval = () => {
    const [hazopList, setHazopList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showHazopViewPopup, setShowHazopViewPopup] = useState(false);
    const [selectedHazopId, setSelectedHazopId] = useState(null);

    const empCode = localStorage.getItem("empCode");


    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleOpenHazop = (item) => {
        setSelectedHazopId(item.id);
        setShowHazopViewPopup(true);
    };



    const fetchPendingApprovals = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/hazopRegistration/hazop/byVerificationFilters?verificationEmpCode=${empCode}&sendForVerification=true&verificationActionTaken=false`
            );
            setHazopList(res.data || []);
        } catch (err) {
            console.error("Error loading approval data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingApprovals();
    }, []);


    const renderDropdown = (item) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}> <FaEllipsisV /> </button>
            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button type="button" onClick={() => handleOpenHazop(item)}> <FaEye /> View </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            <div >
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                <table className="hazoplist-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Title</th>
                            <th>Site</th>
                            <th>Department</th>
                            <th>Created Date</th>
                            <th>Sent By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {hazopList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data1">
                                    No Records Found
                                </td>
                            </tr>
                        ) : (
                            hazopList.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{item.site || "-"}</td>
                                    <td>{item.title || '-'}</td>
                                    <td>{item.department || '-'}</td>
                                    <td>{formatDate(item.hazopCreationDate || '-')}</td>
                                    <td>{item.createdBy || "-"}</td>

                                    <td>
                                        {renderDropdown(item)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {showHazopViewPopup && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={() => setShowHazopViewPopup(false)}><FaTimes /></button>
                        <CompleteHazopView
                            hazopId={selectedHazopId}
                            onClose={() => setShowHazopViewPopup(false)}
                            mode="confirmation"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default HazopConfirmationApproval;
