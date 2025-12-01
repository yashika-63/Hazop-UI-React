import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import './Approval.css';


import HazopTeamAcceptanceApproval from "./HazopTeamAcceptanceApproval";
import { FaCalendarDay } from "react-icons/fa";


const RequestHandler = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'HazopTeamAcceptance';
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

                    {/* <button 
                        type="button" 
                        className={activeSection === 'HazopNodeAcceptance' ? 'active' : ''} 
                        onClick={() => handleButtonClick('HazopNodeAcceptance')}
                    >
                        <FontAwesomeIcon className="icon" icon={faClipboardList} />
                        Node Acceptance
                    </button> */}

                </div>

                <div className="Companycontent">
                    {activeSection === 'HazopTeamAcceptance' && <HazopTeamAcceptanceApproval />}
                    {activeSection === 'HazopNodeAcceptance' && <HazopTeamAcceptance />}

                </div>
            </div>
        </div>
    );
};

export default RequestHandler;
