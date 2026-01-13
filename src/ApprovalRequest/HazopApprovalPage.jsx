import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDate, showToast, truncateText } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaEye, FaEllipsisV, FaTimes, FaCheck } from "react-icons/fa";

const HazopApprovalPage = ({onActionComplete}) => {
    const [pendingActions, setPendingActions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Navigation ---
    const navigate = useNavigate();

    // --- Dropdown & Modal States ---
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // --- OTP Logic States ---
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const empCode = localStorage.getItem("empCode");

    const fetchPendingActions = async () => {
        if (!empCode) {
            showToast("Employee Code not found. Please log in.", "error");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${strings.localhost}/api/team-comments/pending-actions?empCode=${empCode}`
            );
            setPendingActions(response.data || []);
        } catch (error) {
            console.error("Error fetching pending actions:", error);
            // showToast("Failed to fetch pending actions.", "error");
            setPendingActions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingActions();
    }, []);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    // --- 3. Handle View Details Navigation (Updated) ---
    const handleViewDetails = (item) => {
        localStorage.setItem("hazopId", item.javaHazopRegistration?.id);
        navigate("/HazopView");
    };

    const handleVerifyClick = (item) => {
        setSelectedItem(item);
        setOtpSent(false);
        setOtpValue("");
        setShowVerifyModal(true);
        setOpenDropdown(null);
    };

    const handleCloseModal = () => {
        setShowVerifyModal(false);
        setSelectedItem(null);
        setOtpSent(false);
        setOtpValue("");
    };

    const handleSendOtp = async () => {
        if (!selectedItem) return;

        setIsSendingOtp(true);
        try {
            await axios.post(
                `${strings.localhost}/api/team-comments/send-otp`,
                null,
                {
                    params: {
                        commentId: selectedItem.id,
                        empCode: empCode,
                        empEmail: selectedItem.empEmail || ""
                    }
                }
            );

            showToast("OTP sent successfully to your email.", "success");
            setOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
            showToast("Failed to send OTP. Please try again.", "error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue) {
            showToast("Please enter the OTP.", "warning");
            return;
        }
        setIsVerifyingOtp(true);
        try {
            await axios.post(
                `${strings.localhost}/api/team-comments/verify-otp`,
                null,
                {
                    params: {
                        commentId: selectedItem.id,
                        empCode: empCode,
                        empEmail: selectedItem.empEmail || "",
                        otp: otpValue
                    }
                }
            );

            showToast("Verified successfully!", "success");
            handleCloseModal();
            fetchPendingActions();
            if (onActionComplete) {
                onActionComplete();
            }

        } catch (error) {
            console.error("Error verifying OTP:", error);
            showToast("Invalid OTP or Verification Failed.", "error");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div>
                <table className="hazoplist-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>Sr.No</th>
                            <th>Hazop Title</th>
                            <th>Assigned Date</th>
                            <th>Department</th>
                            <th>Created By</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingActions.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data1">
                                    {loading ? "Loading..." : "No Pending Actions Found"}
                                </td>
                            </tr>
                        ) : (
                            pendingActions.map((item, index) => (
                                <tr key={item.id || index} className="main-row">
                                    <td>{index + 1}</td>
                                    <td>{item.javaHazopRegistration?.hazopTitle || "-"}</td>
                                    <td>{formatDate(item.assignDate)}</td>
                                    <td>{item.javaHazopRegistration?.department || "-"}</td>
                                    <td>{item.javaHazopRegistration?.createdBy || '-'}</td>
                                    <td>
                                        <span className={item.sendForReviewStatus ? "status-completed" : "status-pending"}>
                                            {item.sendForReviewStatus ? "Completed" : "Pending"}
                                        </span>
                                    </td>

                                    <td className="action-cell">
                                        <div className="dropdown" style={{ position: 'relative' }}>
                                            <button
                                                className="dots-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDropdown(item.id);
                                                }}
                                            >
                                                <FaEllipsisV />
                                            </button>

                                            {openDropdown === item.id && (
                                                <div className="dropdown-content show" style={{ right: 0, top: '100%' }}>
                                                    {!item.sendForReviewStatus && (
                                                        <button onClick={() => handleVerifyClick(item)}>
                                                            <FaCheck /> Verify
                                                        </button>
                                                    )}

                                                    {/* View Details Button */}
                                                    <button onClick={() => handleViewDetails(item)}>
                                                        <FaEye /> View Details
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Verification Modal --- */}
            {showVerifyModal && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-body" style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0 }}>Action Verification</h4>
                            <FaTimes
                                style={{ cursor: 'pointer' }}
                                onClick={handleCloseModal}
                            />
                        </div>

                        <div className="modal-content-details">
                            <div className="detail-row" style={{ marginBottom: '10px' }}>
                                <strong>Employee:</strong> {selectedItem.empCode}
                            </div>
                            <div className="detail-row" style={{ marginBottom: '10px' }}>
                                <strong>Assigned Date:</strong> {formatDate(selectedItem.assignDate)}
                            </div>
                            <div className="detail-row" style={{ marginBottom: '10px' }}>
                                <strong>Pending Comment/Action:</strong>
                                <p style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '5px', minHeight: '40px' }}>
                                    {selectedItem.comment || "No specific comment provided."}
                                </p>
                            </div>
                        </div>

                        {!otpSent ? (
                            <div className="otp-init-section" style={{ textAlign: 'center', marginTop: '20px' }}>
                                <p>To verify this action, please send an OTP to your registered email: <strong>{selectedItem.empEmail}</strong></p>
                                <div className="confirm-buttons" style={{ marginTop: '15px' }}>
                                    <button
                                        className="cancel-btn"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="confirm-btn"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                    >
                                        {isSendingOtp ? "Sending..." : "Send OTP"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="otp-verify-section" style={{ marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>Enter OTP</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter 6-digit OTP"
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value)}
                                        maxLength={6}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            fontSize: '16px',
                                            letterSpacing: '2px',
                                            textAlign: 'center',
                                            marginBottom: '15px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>

                                <div className="confirm-buttons">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setOtpSent(false)}
                                        disabled={isVerifyingOtp}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="confirm-btn"
                                        style={{ backgroundColor: '#28a745' }}
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp || otpValue.length < 4}
                                    >
                                        {isVerifyingOtp ? "Verifying..." : "Verify & Complete"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazopApprovalPage;