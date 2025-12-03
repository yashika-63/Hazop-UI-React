import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import './Approval.css';

import HazopTeamAcceptanceApproval from "./HazopTeamAcceptanceApproval";
import HazopRecommendationApproval from "./HazopRecommandationApproval";
import { FaCalendarDay, FaLightbulb } from "react-icons/fa";

const RequestHandler = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'HazopTeamAcceptance';
    const [activeSection, setActiveSection] = useState(defaultTab);

    // track which tabs have been loaded to avoid re-fetch
    const [loadedTabs, setLoadedTabs] = useState([defaultTab]);

    const handleButtonClick = (section) => {
        setActiveSection(section);
        setSearchParams({ tab: section });

        // mark this tab as loaded
        if (!loadedTabs.includes(section)) {
            setLoadedTabs([...loadedTabs, section]);
        }
    };

    return (
        <div>
            <h1>Approval Request</h1>
            <div className="layout">
                <div className='verticalForm'>
                    <button
                        type="button"
                        className={activeSection === 'HazopTeamAcceptance' ? 'active' : ''}
                        onClick={() => handleButtonClick('HazopTeamAcceptance')}
                    >
                        <FaCalendarDay />
                        Team Member Acceptance
                    </button>

                    <button
                        type="button"
                        className={activeSection === 'HazopRecommendationApproval' ? 'active' : ''}
                        onClick={() => handleButtonClick('HazopRecommendationApproval')}
                    >
                        <FaLightbulb />
                        Hazop Recommendation
                    </button>
                </div>

                <div className="Companycontent">
                    {activeSection === 'HazopTeamAcceptance' && <HazopTeamAcceptanceApproval />}
                    {activeSection === 'HazopRecommendationApproval' && <HazopRecommendationApproval />}
                </div>
            </div>
        </div>
    );
};

export default RequestHandler;
