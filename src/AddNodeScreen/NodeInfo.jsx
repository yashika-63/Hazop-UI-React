import React, { useEffect, useState } from "react";
import { formatDate } from "../CommonUI/CommonUI";
import { strings } from "../string";

const NodeInfo = ({ currentNodeId }) => {
  const [node, setNode] = useState(null);

    useEffect(() => {
        const fetchNode = async () => {
          try {
            const response = await fetch(
              `http://${strings.localhost}/api/hazopNode/${currentNodeId}`
            );
    
            if (response.ok) {
              const data = await response.json();
              setNode(data);
            }
          } catch (err) {
            console.error("Error fetching node:", err);
          }
        };
    
        fetchNode();
      }, [currentNodeId]);

      return(
        
        <div className="hazop-info">
          <div className="input-row">
            <div>
              <strong>Node No.: </strong> {node?.nodeNumber}
            </div>
            <div>
              <strong>Registration Date: </strong>
              {node?.registrationDate && formatDate(node.registrationDate)}
            </div>
            <div>
              <strong>Completion Status: </strong>
              <span
                className={
                  node?.completionStatus === true
                    ? "status-completed"
                    : "status-pending"
                }
              >
                {node?.completionStatus ? "Completed" : "Ongoing"}
              </span>
            </div>
            <div>
              <strong>PID Revision: </strong> {node?.pIdRevision}
            </div>
          </div>
          <div className="input-row">
            <div>
              <strong>SOP No.: </strong> {node?.sopNo}
            </div>
            <div>
              <strong>SOP Date: </strong> {formatDate(node?.sopDate)}
            </div>
            <div>
              <strong>Temperature: </strong> {node?.temprature}
            </div>
            <div>
              <strong>Pressure: </strong> {node?.pressure}
            </div>
          </div>
          <div className="input-row">
            <div>
              <strong>Quantity Flow Rate: </strong> {node?.quantityFlowRate}
            </div>
            <div>
              <strong>Chemical Utilities: </strong> {node?.chemicalAndUtilities}
            </div>
            <div>
              <strong>Equipment: </strong> {node?.equipment}
            </div>
            <div>
              <strong>Controls: </strong> {node?.controls}
            </div>
          </div>
          <div>
            <strong>Design Intent:</strong> {node?.designIntent}
          </div>
        </div>
      );
};

export default NodeInfo;