import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import '../styles/global.css';
import { getRiskClass, getRiskColor, getRiskLevelText, showToast, truncateWords } from '../CommonUI/CommonUI';
import { strings } from '../string';

const HazopAllRecommendations = ({ hazopId }) => {

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    /** GLOBAL EMPLOYEE SEARCH **/
    const [globalSearch, setGlobalSearch] = useState("");
    const [globalResults, setGlobalResults] = useState([]);
    const [selectedGlobalEmployee, setSelectedGlobalEmployee] = useState(null);

    /* =====================================
       FETCH DATA
       ===================================== */
    const fetchRecommendations = async () => {
        if (!hazopId) return;

        setLoading(true);
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`
            );

            setRecommendations(res.data ?? []);

        } catch (err) {
            console.error(err);
            showToast("Failed to load recommendations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [hazopId]);


    /* =====================================
       HANDLE GLOBAL EMPLOYEE SEARCH
       ===================================== */
    const handleGlobalSearchChange = async (value) => {
        setGlobalSearch(value);

        if (value.length < 2) {
            setGlobalResults([]);
            return;
        }

        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );

            setGlobalResults(res.data || []);

        } catch (err) {
            console.error(err);
        }
    };


    /* =====================================
       SEND ALL RECOMMENDATIONS
       ===================================== */
    const handleSendAll = async () => {
        if (!selectedGlobalEmployee) {
            showToast("Please select a reviewer first", "error");
            return;
        }

        const empCode = selectedGlobalEmployee.empCode;

        // Filter pending recommendations
        const pendingRecs = recommendations.filter(
            (rec) => rec.sendForVerificationActionStatus !== true
        );

        if (pendingRecs.length === 0) {
            showToast("No pending recommendations to send.", "info");
            return;
        }

        setLoading(true);

        try {
            for (const rec of pendingRecs) {
                await axios.put(
                    `http://${strings.localhost}/api/nodeRecommendation/sendForVerification/${rec.id}/${empCode}`
                );
            }

            showToast("Pending recommendations sent successfully!", "success");
            fetchRecommendations();

        } catch (err) {
            console.error(err);
            showToast("Failed to send pending recommendations", "error");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>

            {/* ============================ */}
            {/* GLOBAL EMPLOYEE SELECTOR     */}
            {/* ============================ */}
            <div className="top-row">
                <div className="search-container">
                    <div className="search-bar-wrapper">
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={globalSearch}
                            onChange={(e) => handleGlobalSearchChange(e.target.value)}
                        />
                        <FaSearch className="search-icon-table" />

                        {globalResults.length > 0 && (
                            <ul className="search-results-table">
                                {globalResults.map((emp) => (
                                    <li
                                        key={emp.empCode}
                                        onClick={() => {
                                            setSelectedGlobalEmployee(emp);
                                            setGlobalSearch(emp.empCode);
                                            setGlobalResults([]);
                                        }}
                                    >
                                        {emp.empCode} — {emp.emailId || "NA"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE — EMP TAG + BUTTON */}
                <div className="right-actions">
                    {selectedGlobalEmployee && (
                        <div className="selected-emp-tag">
                            <strong>{selectedGlobalEmployee.empCode}</strong> (
                            {selectedGlobalEmployee.emailId})
                        </div>
                    )}

                    <button
                        className="confirm-btn send-all-btn"
                        disabled={!selectedGlobalEmployee || loading}
                        onClick={handleSendAll}
                    >
                        {loading ? "Sending..." : "Send All for review"}
                    </button>
                </div>

            </div>



            {/* ============================ */}
            {/*      RECOMMENDATION TABLE    */}
            {/* ============================ */}
            <table className="assigned-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Initial Risk rating</th>
                        <th>Final Risk rating</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="no-data1">No data found</td>
                        </tr>
                    ) : (
                        recommendations.map((rec, index) => (
                            <tr key={rec.id}>
                                <td>{index + 1}</td>
                                <td>{truncateWords(rec.recommendation)}</td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.riskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.riskRating || '-'}
                                </td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.additionalRiskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.additionalRiskRating || '-'}
                                </td>
                                <td>
                                    {rec.sendForVerificationActionStatus === true ? (
                                        <span className="sent-badge">✔ Sent</span>
                                    ) : (
                                        <span className="pending-badge">Pending</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </div>
    );
};

export default HazopAllRecommendations;
