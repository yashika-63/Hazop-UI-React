import React from "react";
import { FaClock, FaFileAlt } from "react-icons/fa";
import { FaFolderClosed } from "react-icons/fa6";
import { useSearchParams, useLocation } from "react-router-dom";
import HazopAllRecommendations from "./HazopAllRecommendations";
import HazopRecommendationsSecondScreen from "./HazopRecommendationsSecondScreen";
import HazopRecommendationsThirdScreen from "./HazopRecommendationsThirdScreen";
import "./Recommandation.css";

const RecommandationHandler = () => {
    const location = useLocation();

    // Get hazopId from navigation state or session storage
    const hazopId = location.state?.hazopId || sessionStorage.getItem("hazopId");

    // URL-based tab handling
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") || "HazopAllRecommendations";

    const handleButtonClick = (section) => {
        setSearchParams({ tab: section });
    };

    return (
        <div>
            {/* ================= TOP TAB BAR ================= */}
            <div className="TopFormBar">
                <button
                    type="button"
                    className={`active-section-item ${
                        tab === "HazopAllRecommendations" ? "active" : ""
                    }`}
                    onClick={() => handleButtonClick("HazopAllRecommendations")}
                >
                    <FaClock style={{ marginRight: "8px" }} />
                    View Recommendations
                </button>

                <button
                    type="button"
                    className={`active-section-item ${
                        tab === "HazopRecommendationsSecondScreen" ? "active" : ""
                    }`}
                    onClick={() => handleButtonClick("HazopRecommendationsSecondScreen")}
                >
                    <FaFileAlt style={{ marginRight: "8px" }} />
                    Assign Recommendations
                </button>

                <button
                    type="button"
                    className={`active-section-item ${
                        tab === "HazopRecommendationsThirdScreen" ? "active" : ""
                    }`}
                    onClick={() => handleButtonClick("HazopRecommendationsThirdScreen")}
                >
                    <FaFolderClosed style={{ marginRight: "8px" }} />
                    Complete Recommendations
                </button>
            </div>

            {/* ================= TAB CONTENT ================= */}
            {tab === "HazopAllRecommendations" && (
                <HazopAllRecommendations
                    key="all"
                    hazopId={hazopId}
                />
            )}

            {tab === "HazopRecommendationsSecondScreen" && (
                <HazopRecommendationsSecondScreen
                    key="second"
                    hazopId={hazopId}
                />
            )}

            {tab === "HazopRecommendationsThirdScreen" && (
                <HazopRecommendationsThirdScreen
                    key="third"
                    hazopId={hazopId}
                />
            )}
        </div>
    );
};

export default RecommandationHandler;
