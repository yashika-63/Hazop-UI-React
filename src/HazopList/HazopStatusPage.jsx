import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import { formatDate, showToast, truncateWords } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaComment, FaEllipsisV, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HazopStatusPage = () => {
    const [completedHazops, setCompletedHazops] = useState([]);
    const [ongoingHazops, setOngoingHazops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [selectedHazop, setSelectedHazop] = useState(null);
    const [comment, setComment] = useState("");
    const empCode = localStorage.getItem("empCode");
    const navigate = useNavigate();

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const fetchHazops = async () => {
        setLoading(true);
        try {
            const [completedRes, ongoingRes] = await Promise.all([
                axios.get(
                    `http://${strings.localhost}/api/hazopRegistration/by-emp-code-and-status`,
                    { params: { empCode, completionStatus: true } }
                ),
                axios.get(
                    `http://${strings.localhost}/api/hazopRegistration/by-emp-code-and-status`,
                    { params: { empCode, completionStatus: false } }
                ),
            ]);
            setCompletedHazops(completedRes.data ?? []);
            setOngoingHazops(ongoingRes.data ?? []);
        } catch (error) {
            console.error("Error fetching hazops:", error);
            showToast("Failed to fetch HAZOP data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (empCode) fetchHazops();
    }, [empCode]);

    const handleView = (item) => {
        localStorage.setItem("hazopId", item.id);
        navigate("/complete-hazop-view");
    };
    
      

    const handleComment = (item) => {
        setSelectedHazop(item);
        setComment("");
        setShowCommentPopup(true);
    };

    const saveComment = async () => {
        if (!comment.trim()) return showToast("Please enter a comment", "warning");
        try {
            await axios.post(
                `http://${strings.localhost}/api/team-comments/save/${empCode}/${selectedHazop.id}`,
                { comment }
            );
            showToast("Comment saved successfully", "success");
            setShowCommentPopup(false);
            fetchHazops(); 
        } catch (error) {
            console.error(error);
            showToast("Failed to save comment", "error");
        }
    };

    const renderDropdown = (item, isCompleted) => (
        <div className="dropdown top-header">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button onClick={() => handleView(item)}>
                        <FaEye /> View
                    </button>
                    {!isCompleted && (
                        <button onClick={() => handleComment(item)}>
                            <FaComment /> Comment
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    const renderTable = (data, title, isCompleted) => (
        <div className="section-block">
            <h5>{title}</h5>

            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>HAZOP ID</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Site</th>
                        <th>Status</th>
                        <th>Creation Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="no-data1">No data available</td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.id ?? "-"}</td>
                                <td>{truncateWords(item.hazopTitle ?? "-")}</td>
                                <td>{item.department ?? "-"}</td>
                                <td>{item.site ?? "-"}</td>
                                <td>
                                    <span className={
                                        item.completionStatus === true
                                            ? "status-completed"
                                            : "status-pending"
                                    }>
                                        {item.completionStatus === true ? "Completed" : "Ongoing"}
                                    </span>
                                </td>

                                <td>{item.hazopCreationDate ? formatDate(item.hazopCreationDate) : "-"}</td>
                                <td>{renderDropdown(item, isCompleted)}</td>
                            </tr>
                        ))
                    )}
                </tbody>

            </table>

        </div>
    );

    return (
        <div>
            {loading && <p>Loading...</p>}
            {!loading && renderTable(completedHazops, "Completed HAZOP's", true)}
            {!loading && renderTable(ongoingHazops, "Ongoing HAZOP's", false)}

            {showCommentPopup && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h5>Add Comment</h5>
                        <textarea
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter your comment..."
                        />
                        <div className="confirm-buttons">
                            <button type="button" className="cancel-btn" onClick={() => setShowCommentPopup(false)}>Cancel</button>
                            <button type="button" className="confirm-btn" onClick={saveComment}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazopStatusPage;
