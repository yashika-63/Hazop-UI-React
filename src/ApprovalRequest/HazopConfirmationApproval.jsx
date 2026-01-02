import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDate, truncateWords } from "../CommonUI/CommonUI";
import { FaEllipsisV, FaEye } from "react-icons/fa";
import { strings } from "../string";
import { useNavigate } from "react-router-dom";
import '../styles/global.css';

const HazopConfirmationApproval = () => {
    const [hazopList, setHazopList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const empCode = localStorage.getItem("empCode");
    const navigate = useNavigate();

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleViewClick = (item) => {
        // Store selected HAZOP for confirmation approval view
        const payload = {
            hazopId: item.id,
            hazopData: item
        };
        localStorage.setItem("selectedHazopConfirmation", JSON.stringify(payload));
        navigate("/hazop-confirmation-view"); // Navigate to dedicated page
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
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>
            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button type="button" onClick={() => handleViewClick(item)}>
                        <FaEye /> View
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Hazop Title</th>
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
                            <td colSpan="7" className="no-data1">No Records Found</td>
                        </tr>
                    ) : (
                        hazopList.map((item, idx) => (
                            <tr key={idx}>
                                <td>{truncateWords(item.hazopTitle || '-')}</td>
                                <td>{truncateWords(item.site || "-")}</td>
                                <td>{item.department || '-'}</td>
                                <td>{formatDate(item.hazopCreationDate || '-')}</td>
                                <td>{item.createdBy || "-"}</td>
                                <td>{renderDropdown(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HazopConfirmationApproval;
