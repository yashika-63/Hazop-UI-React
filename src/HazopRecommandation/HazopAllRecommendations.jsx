import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import '../styles/global.css';
import { showToast, truncateWords } from '../CommonUI/CommonUI';
import { strings } from '../string';

const HazopAllRecommendations = ({ hazopId }) => {

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchInputs, setSearchInputs] = useState({});
    const [searchResults, setSearchResults] = useState({});
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [sendingIds, setSendingIds] = useState([]);

    /* =====================================
       FETCH DATA USING FIRST API
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


    /* ===========================
       INLINE SEARCH HANDLER
       =========================== */
    const handleSearchChange = async (recId, value) => {
        setSearchInputs(prev => ({ ...prev, [recId]: value }));
        setSelectedEmployees(prev => ({ ...prev, [recId]: null }));

        if (value.length < 2) {
            setSearchResults(prev => ({ ...prev, [recId]: [] }));
            return;
        }

        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );

            setSearchResults(prev => ({ ...prev, [recId]: res.data || [] }));

        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectEmployee = (recId, emp) => {
        setSelectedEmployees(prev => ({ ...prev, [recId]: emp }));
        setSearchInputs(prev => ({ ...prev, [recId]: emp.empCode }));
        setSearchResults(prev => ({ ...prev, [recId]: [] }));
    };

    /* ===========================
       SEND ASSIGNMENT
       =========================== */
    const handleAssignSend = async (recId) => {
        const employee = selectedEmployees[recId];
        if (!employee) return;

        setSendingIds(prev => [...prev, recId]);

        try {
            await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/sendForVerification/${recId}/${employee.empCode}`
            );

            showToast("Sent successfully!", "success");

            // Fetch updated data immediately
            await fetchRecommendations();

            // Reset selected employee for that row
            setSelectedEmployees(prev => ({ ...prev, [recId]: null }));
            setSearchInputs(prev => ({ ...prev, [recId]: '' }));

        } catch {
            showToast("Failed to send", "error");
        } finally {
            setSendingIds(prev => prev.filter(id => id !== recId));
        }
    };

    return (
        <div>
            <table className="assigned-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Assign Employee</th>
                        <th>Send</th>
                    </tr>
                </thead>

                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="no-data1">No data found</td>
                        </tr>
                    ) : (
                        recommendations.map((rec, index) => (
                            <tr key={rec.id}>
                                <td>{index + 1}</td>
                                <td>{truncateWords(rec.recommendation)}</td>
                                <td>
                                    <div className="search-bar-table">
                                        <input
                                            type="text"
                                            placeholder="Search employee..."
                                            value={searchInputs[rec.id] || ''}
                                            onChange={e => handleSearchChange(rec.id, e.target.value)}
                                        />

                                        <FaSearch className="search-icon-table" />

                                        {searchResults[rec.id]?.length > 0 && (
                                            <ul className="search-results-table">
                                                {searchResults[rec.id].map(emp => (
                                                    <li
                                                        key={emp.empCode}
                                                        onClick={() => handleSelectEmployee(rec.id, emp)}
                                                    >
                                                        {emp.empCode} - ({emp.emailId || 'NA'})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <button
                                        className="confirm-btn"
                                        onClick={() => handleAssignSend(rec.id)}
                                        disabled={!selectedEmployees[rec.id] || sendingIds.includes(rec.id)}
                                        title={
                                            !selectedEmployees[rec.id]
                                                ? "Select employee first"
                                                : sendingIds.includes(rec.id)
                                                    ? "Assigning..."
                                                    : ""
                                        }
                                    >
                                        {sendingIds.includes(rec.id) ? "Sending..." : "Send"}
                                    </button>
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
