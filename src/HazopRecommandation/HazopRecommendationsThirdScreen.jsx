import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import './Recommandation.css';
const HazopRecommendationsThirdScreen = ({ hazopId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const res = await axios(
                `http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`
            );

            setRecords(res.data || []);
        } catch (err) {
            console.error("API Error:", err);
            setRecords([]);
            showToast("Failed to fetch data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hazopId) {
            fetchRecords();
        }
    }, [hazopId]);

    return (
        <div className="third-screen-container">
            <h5>Verification Action Records</h5>


            <table className="recommendation-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Recommendation</th>
                        <th>Management Remark</th>
                        <th>Verified By</th>
                        <th>Responsible</th>
                        <th>Completion Status</th>
                        <th>Completion Date</th>
                    </tr>
                </thead>

                <tbody>
                    {records.length === 0 ? (
                        <p className="no-data1">No Data Available</p>
                    ) : (
                        records.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.recommendation}</td>
                                <td>{item.remarkbyManagement || "-"}</td>
                                <td>{item.verificationResponsibleEmployeeName || "-"}</td>
                                <td>{item.responsibility || "-"}</td>
                                <td>
                                    {item.completionStatus === true
                                        ? "Completed"
                                        : item.completionStatus === false
                                            ? "Pending"
                                            : "-"}
                                </td>

                                <td>{item.CompletionDate || "-"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </div>
    );
};

export default HazopRecommendationsThirdScreen;
