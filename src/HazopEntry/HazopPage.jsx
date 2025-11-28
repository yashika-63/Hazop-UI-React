import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HazopPage.css";
import HazopRegistration from "./HazopRegistration";
import { strings } from "../string";
import { FaTimes } from "react-icons/fa";

const HazopPage = () => {
    const [newRegistered, setNewRegistered] = useState([]);
    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);

    const [showPopup, setShowPopup] = useState(false);

    const openPopup = () => setShowPopup(true);
    const closePopup = () => setShowPopup(false);

    // Load kanban data
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

    return (
        <div className="page-wrapper">
            <div className="page-card">
                <div className="hazop-header">
                    <h2>HAZOP Dashboard</h2>
                </div>
                <button className="create-btn" onClick={openPopup}> Create Hazop </button>

                <div className="kanban-container">
                    <div className="kanban-column">
                        <h3>New Registered</h3>
                        {newRegistered.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                <div className="card-title">{item.title || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                            </div>
                        ))}
                    </div>
                    <div className="kanban-column">
                        <h3>Pending</h3>
                        {pending.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                <div className="card-title">{item.title || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                            </div>
                        ))}
                    </div>
                    <div className="kanban-column">
                        <h3>Completed</h3>
                        {completed.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                <div className="card-title">{item.title || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={closePopup}><FaTimes/></button>
                        <HazopRegistration closePopup={closePopup} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazopPage;
