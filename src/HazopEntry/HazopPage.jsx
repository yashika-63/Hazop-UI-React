import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HazopPage.css";
import HazopRegistration from "./HazopRegistration";
import { strings } from "../string";
import { FaEllipsisV, FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import '../CommonCss/CommonCss.css';

const HazopPage = () => {
    const [newRegistered, setNewRegistered] = useState([]);
    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState("NewCreated");
    const openPopup = () => setShowPopup(true);
    const closePopup = () => setShowPopup(false);
    const [openDropdown, setOpenDropdown] = useState(null);


    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    useEffect(() => {
        fetchColumns();
    }, []);

    const fetchColumns = async () => {
        try {
            const col1 = await axios.get(
                `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
            );
            console.log("response,", col1);
            const col2 = await axios.get(
                `http://localhost:5559/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
            );

            const col3 = await axios.get(
                `http://localhost:5559/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
            );

            setNewRegistered(col1.data);
            setPending(col2.data);
            setCompleted(col3.data);
        } catch (err) {
            console.error("Error loading HAZOP data:", err);
        }
    };


    const renderDropdown = (item) => (
        <div className="dropdown card-dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button onClick={() => handleView(item)}><FaEye /> View</button>
                    <button onClick={() => handleUpdate(item)}><FaEdit /> Update</button>
                    <button onClick={() => handleDelete(item)}><FaTrash /> Delete</button>
                </div>
            )}
        </div>
    );


    return (
        <div className="page-wrapper">
            <div className="page-card">
                <div className="hazop-header">
                    <h2>HAZOP Dashboard</h2>
                </div>
                <button className="create-btn" onClick={openPopup}> Create Hazop </button>

                <div className="kanban-container">
                    <div className="kanban-column">
                        <div
                            className={`column-header menu-item ${activeTab === "NewCreated" ? "active" : ""}`}
                            onClick={() => setActiveTab("NewCreated")}
                        >
                            New Registered
                        </div>
                        {newRegistered.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                {renderDropdown(item)}
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{item.hazopCreationDate}</div>
                            </div>
                        ))}
                    </div>

                    <div className="kanban-column">
                        <div
                            className="column-header menu-item"
                            onClick={() => setActiveTab("Pending")}
                        >
                            Pending
                        </div>
                        {pending.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                {renderDropdown(item)}
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{item.hazopCreationDate}</div>
                            </div>
                        ))}
                    </div>

                    <div className="kanban-column">
                        <div
                            className={`column-header menu-item ${activeTab === "Completed" ? "active" : ""}`}
                            onClick={() => setActiveTab("Completed")}
                        >
                            Completed
                        </div>
                        {completed.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                {renderDropdown(item)}
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{item.hazopCreationDate}</div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <HazopRegistration closePopup={closePopup} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazopPage;

