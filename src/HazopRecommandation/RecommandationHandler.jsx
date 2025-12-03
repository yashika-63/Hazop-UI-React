import React, { useState, useEffect } from "react";
import { FaClock, FaFileAlt } from "react-icons/fa";
import { FaFolderClosed } from "react-icons/fa6";
import { useSearchParams, useLocation } from "react-router-dom"; // <-- import useLocation
import HazopAllRecommendations from "./HazopAllRecommendations";
import './Recommandation.css';
import HazopRecommendationsThirdScreen from "./HazopRecommendationsThirdScreen";
import HazopRecommendationsSecondScreen from "./HazopRecommendationsSecondScreen";

const RecommandationHandler = () => {
    const location = useLocation();

    const hazopId = location.state?.hazopId || sessionStorage.getItem("hazopId");

    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'HazopAllRecommendations';
    const [activeSection, setActiveSection] = useState(defaultTab);

    useEffect(() => {
        const currentTab = searchParams.get('tab');
        if (currentTab && currentTab !== activeSection) {
            setActiveSection(currentTab);
        }
    }, [searchParams, activeSection]);

    const handleButtonClick = (section) => {
        setActiveSection(section);
        setSearchParams({ tab: section });
    };

    return (
        <div>
            <div className="TopFormBar">
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'HazopAllRecommendations' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('HazopAllRecommendations')}
                >
                    <FaClock /> Active
                </button>

                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'HazopRecommendationsSecondScreen' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('HazopRecommendationsSecondScreen')}
                >
                    <FaFileAlt /> HazopRecommendationsSecondScreen
                </button>

                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'HazopRecommendationsThirdScreen' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('HazopRecommendationsThirdScreen')}
                >
                    <FaFolderClosed /> HazopRecommendationsThirdScreen
                </button>
            </div>

            {activeSection === 'HazopAllRecommendations' && <HazopAllRecommendations hazopId={hazopId} />}
            {activeSection === 'HazopRecommendationsSecondScreen' && <HazopRecommendationsSecondScreen hazopId={hazopId} />}
            {activeSection === 'HazopRecommendationsThirdScreen' && <HazopRecommendationsThirdScreen hazopId={hazopId} />}
        </div>
    );
};

export default RecommandationHandler;
