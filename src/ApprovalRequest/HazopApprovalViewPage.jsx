import React, { useEffect, useState } from "react";
import CompleteHazopView from "../HazopList/CompleteHazopView";
import { FaTimes } from "react-icons/fa";

const HazopApprovalViewPage = () => {
    const [selectedHazop, setSelectedHazop] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("selectedHazopApproval");
        if (stored) setSelectedHazop(JSON.parse(stored));
    }, []);

    if (!selectedHazop) return <div>No HAZOP selected</div>;

    return (
        <div>
            <button className="close-btn" onClick={() => {
                localStorage.removeItem("selectedHazopApproval");
                setSelectedHazop(null);
                window.history.back();
            }}>
                <FaTimes />
            </button>

            <CompleteHazopView
                hazopId={selectedHazop.hazopId}
                approvalRequestId={selectedHazop.approvalRequestId}
                mode="approval"
                onClose={() => {
                    localStorage.removeItem("selectedHazopApproval");
                    setSelectedHazop(null);
                    window.history.back();
                }}
            />
        </div>
    );
};

export default HazopApprovalViewPage;
