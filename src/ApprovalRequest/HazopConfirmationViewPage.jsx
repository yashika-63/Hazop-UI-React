import React, { useEffect, useState } from "react";
import CompleteHazopView from "../HazopList/CompleteHazopView";
import { FaTimes } from "react-icons/fa";

const HazopConfirmationViewPage = () => {
    const [selectedHazop, setSelectedHazop] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("selectedHazopConfirmation");
        if (stored) setSelectedHazop(JSON.parse(stored));
    }, []);

    if (!selectedHazop) return <div>No HAZOP selected</div>;

    return (
        <div className="hazop-view-page">

            <CompleteHazopView
                hazopId={selectedHazop.hazopId}
                mode="confirmation"
                onClose={() => {
                    localStorage.removeItem("selectedHazopConfirmation");
                    setSelectedHazop(null);
                    window.history.back();
                }}
            />
        </div>
    );
};

export default HazopConfirmationViewPage;
