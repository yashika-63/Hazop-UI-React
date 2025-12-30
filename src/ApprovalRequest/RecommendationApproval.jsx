import React from "react";
import PendingRecommendationApproval from "./PendingRecommendationApproval";
import CompleteRecommendationApproval from "./CompleteRecommendationApproval";

const RecommendationApproval = () => {


    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
const handleRefreshComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    return (
        <div>
            <PendingRecommendationApproval onActionSuccess={handleRefreshComplete}/>
            <CompleteRecommendationApproval refreshTrigger={refreshTrigger}/>
        </div>
    );
};

export default RecommendationApproval;
