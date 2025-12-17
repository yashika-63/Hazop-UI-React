import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./Node.css";
import { strings } from "../string";
import { showToast } from "../CommonUI/CommonUI";
 
const SequenceUpdatePopup = ({ onClose, nodeId }) => {
  const [nodeDetails, setNodeDetails] = useState([]);
 
  useEffect(() => {
    if (nodeId) fetchNodeDetails();
  }, [nodeId]);
 
const fetchNodeDetails = async () => {
  try {
    const response = await axios.get(
      `http://${strings.localhost}/api/hazopNodeDetail/node/${nodeId}`
    );
 
    if (Array.isArray(response.data)) {
      setNodeDetails(response.data);
    } else {
      setNodeDetails([]);
    }
  } catch (err) {
    console.error(err);
    setNodeDetails([]);
    showToast("No node details found", "info");
  }
};
 
 
  // 🔁 Drag End Handler
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
 
    const reordered = Array.from(nodeDetails);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
 
    setNodeDetails(reordered);
 
    // backend expects ONLY list of IDs in correct order
    const payload = reordered.map((item) => item.id);
 
    try {
      await axios.put(
        `http://${strings.localhost}/api/hazopNodeDetail/updateSequenceById/${nodeId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      showToast("Sequence Updated Successfully!", "success");
    } catch (err) {
      console.error("Sequence update failed", err);
      showToast("Failed to update sequence", "error");
    }
  };
 
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Header */}
        <div className="modal-content">
          <h2 className="modal-header">Sequence Details</h2>
                    <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
 
        <DragDropContext onDragEnd={handleDragEnd}>
            <div><strong>Note: </strong><small>Kindly drag and drop the table rows to update the sequence</small></div>
          <table className="hazoplist-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>General Parameter</th>
                <th>Specific Parameter</th>
                <th>Guide Word</th>
                <th>Sequence</th>
              </tr>
            </thead>
 
            <Droppable droppableId="table-rows" direction="vertical">
              {(provided) => (
                <tbody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {nodeDetails.length > 0 ? (
  nodeDetails.map((item, index) => (
    <Draggable
      key={item.id}
      draggableId={String(item.id)}
      index={index}
    >
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? "dragging-row" : ""}
        >
          <td>{index + 1}</td>
          <td>{item.generalParameter}</td>
          <td>{item.specificParameter}</td>
          <td>{item.guidWord}</td>
          <td>{item.nodeDetailNumber}</td>
        </tr>
      )}
    </Draggable>
  ))
) : (
  <tr>
    <td colSpan="5" style={{ textAlign: "center", padding: "16px" }}>
      No sequence details available
    </td>
  </tr>
)}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    </div>
  );
};
 
export default SequenceUpdatePopup;