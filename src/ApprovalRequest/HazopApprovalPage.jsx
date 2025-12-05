import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { FaEllipsisV, FaEye } from "react-icons/fa";
import '../styles/global.css';
import { useNavigate } from "react-router-dom";

const HazopApprovalPage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();
    const empCode = localStorage.getItem("empCode");

    const fetchHazopData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/hazopApproval/by-empcode?empCode=${empCode}&sendForapproval=true`
            );
            setRecords(response.data || []);
        } catch (err) {
            console.error("Error fetching HAZOP completion data:", err);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHazopData();
    }, [empCode]);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const truncateWords = (text, wordLimit = 4) => {
        if (!text) return "-";
        const words = text.split(" ");
        return words.length <= wordLimit ? text : words.slice(0, wordLimit).join(" ") + "...";
    };

    const handleViewClick = (hazop, rec) => {
        const payload = {
            hazopId: hazop.id,
            approvalRequestId: rec.id,
            hazopData: hazop
        };
        localStorage.setItem("selectedHazopApproval", JSON.stringify(payload));
        navigate("/hazop-approval-view"); // Navigate to dedicated page
    };

    const renderDropdown = (hazop, rec) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(hazop.id)}>
                <FaEllipsisV />
            </button>
            {openDropdown === hazop.id && (
                <div className="dropdown-content">
                    <button type="button" onClick={() => handleViewClick(hazop, rec)}>
                        <FaEye /> View
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {loading ? (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <table className="hazoplist-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Hazop Title</th>
                            <th>Site</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data1">No HAZOP found</td>
                            </tr>
                        ) : (
                            records.map((rec, index) => {
                                const hazop = rec.javaHazopRegistration;
                                return (
                                    <tr key={rec.id}>
                                        <td>{index + 1}</td>
                                        <td title={hazop.title}>{truncateWords(hazop.title)}</td>
                                        <td title={hazop.site}>{truncateWords(hazop.site)}</td>
                                        <td>
                                            <span className={hazop.completionStatus ? "status-completed" : "status-pending"}>
                                                {hazop.completionStatus ? "Completed" : "Pending"}
                                            </span>
                                        </td>
                                        <td>{renderDropdown(hazop, rec)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HazopApprovalPage;
