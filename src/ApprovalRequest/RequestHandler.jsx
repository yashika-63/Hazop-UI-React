import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaCalendarDay, FaCheckCircle, FaLightbulb, FaList, FaCheckDouble } from "react-icons/fa";
import HazopTeamAcceptanceApproval from "./HazopTeamAcceptanceApproval";
import { strings } from "../string";
import HazopApprovalPage from "./HazopApprovalPage";
import HazopConfirmationApproval from "./HazopConfirmationApproval";
import RecommendationApproval from "./RecommendationApproval";
import HazopRecommendationApproval from "./HazopRecommandationApproval";

const RequestHandler = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'HazopTeamAcceptance';
    const [activeSection, setActiveSection] = useState(defaultTab);
    const [loadedTabs, setLoadedTabs] = useState([defaultTab]);
    const empCode = localStorage.getItem("empCode");
    // state for counts
    const [counts, setCounts] = useState({
        teamAcceptancePending: 0,
        recommendationVerificationPending: 0,
        registrationVerificationPending: 0
    });

    useEffect(() => {
        fetch(`http://${strings.localhost}/api/hazop-dashboard/total-pending-count?empCode=${empCode}`)
            .then(res => res.json())
            .then(data => {
                setCounts({
                    teamAcceptancePending: data.teamAcceptancePending,
                    recommendationVerificationPending: data.recommendationVerificationPending,
                    registrationVerificationPending: data.registrationVerificationPending
                });
            })
            .catch(err => console.error(err));
    }, []);

    const handleButtonClick = (section) => {
        setActiveSection(section);
        setSearchParams({ tab: section });

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
                        {counts.teamAcceptancePending > 0 && (
                            <span className="badge">{counts.teamAcceptancePending}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={activeSection === 'HazopRecommendationApproval' ? 'active' : ''}
                        onClick={() => handleButtonClick('HazopRecommendationApproval')}
                    >
                        <FaLightbulb />
                        Hazop Recommendation
                        {counts.recommendationVerificationPending > 0 && (
                            <span className="badge">{counts.recommendationVerificationPending}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={activeSection === 'HazopApprove' ? 'active' : ''}
                        onClick={() => handleButtonClick('HazopApprove')}
                    >
                        <FaList />
                        Hazop Verify
                        {counts.registrationVerificationPending > 0 && (
                            <span className="badge">{counts.registrationVerificationPending}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={activeSection === 'HazopConfirmationApproval' ? 'active' : ''}
                        onClick={() => handleButtonClick('HazopConfirmationApproval')}
                    >
                        <FaCheckDouble />
                        Hazop Completion
                        {counts.approvalPending > 0 && (
                            <span className="badge">{counts.approvalPending}</span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={activeSection === 'RecommendationApproval' ? 'active' : ''}
                        onClick={() => handleButtonClick('RecommendationApproval')}
                    >
                        <FaCheckCircle />
                        Recommendation Approval
                        {counts.assignmentPending > 0 && (
                            <span className="badge">{counts.assignmentPending}</span>
                        )}
                    </button>
                </div>

                <div className="Companycontent">
                    {activeSection === 'HazopTeamAcceptance' && <HazopTeamAcceptanceApproval />}
                    {activeSection === 'HazopRecommendationApproval' && <HazopRecommendationApproval />}
                    {activeSection === 'HazopApprove' && <HazopApprovalPage />}
                    {activeSection === 'HazopConfirmationApproval' && <HazopConfirmationApproval />}
                    {activeSection === 'RecommendationApproval' && <RecommendationApproval />}
                </div>
            </div>
        </div>
    );
};

export default RequestHandler;
