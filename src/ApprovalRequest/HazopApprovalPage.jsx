import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { FaEllipsisV, FaEye, FaTimes } from "react-icons/fa";
import '../styles/global.css';
import CompleteHazopView from "../HazopList/CompleteHazopView";

const HazopApprovalPage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedHazop, setSelectedHazop] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };
    const empCode = localStorage.getItem("empCode");



    const openUpdatePopup = (hazop) => {
        setSelectedHazop(hazop);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedHazop(null);
        setIsModalOpen(false);
    };

    const fetchHazopData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/hazopApproval/by-empcode?empCode=${empCode}&sendForapproval=false`
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


    const truncateWords = (text, wordLimit = 4) => {
        if (!text) return "-";
        const words = text.split(" ");
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + "...";
    };

    const renderDropdown = (hazop) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(hazop.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === hazop.id && (
                <div className="dropdown-content">
                    <button onClick={() => openUpdatePopup(hazop)}>
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
                            <th>ID</th>
                            <th>Hazop Name</th>
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
                            records.map((rec,index) => {
                                const hazop = rec.javaHazopRegistration;
                                return (
                                    <tr key={rec.id}>
                                        <td>{index+1}</td>
                                        <td title={hazop.description}>{truncateWords(hazop.description, 4)}</td>
                                        <td title={hazop.site}>{truncateWords(hazop.site, 4)}</td>
                                        <td>
                                            <span className={hazop.completionStatus ? "status-completed" : "status-pending"}>
                                                {hazop.completionStatus ? "Completed" : "Pending"}
                                            </span>
                                        </td>

                                        <td>
                                            {renderDropdown(hazop)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
            )}
            {isModalOpen && selectedHazop && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={closeModal}><FaTimes/></button>
                        <CompleteHazopView
                            hazopId={selectedHazop.id}
                            onClose={closeModal}
                        />
                    </div>
                </div>
            )}


        </div>
    );
};

export default HazopApprovalPage;
