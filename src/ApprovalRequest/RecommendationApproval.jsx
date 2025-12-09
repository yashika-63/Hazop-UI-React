import React from "react";
import PendingRecommendationApproval from "./PendingRecommendationApproval";
import CompleteRecommendationApproval from "./CompleteRecommendationApproval";


const RecommendationApproval = () => {
    return (
        <div>
            <PendingRecommendationApproval />
            <CompleteRecommendationApproval />
        </div>
    );
};

export default RecommendationApproval;
