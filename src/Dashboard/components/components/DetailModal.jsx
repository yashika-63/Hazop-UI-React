import React from 'react';
import { formatDate } from '../../../CommonUI/CommonUI';

const DetailModal = ({ isOpen, onClose, selectedDetail, data }) => {
    if (!isOpen || !selectedDetail) return null;

    return (
        <div className="hazop-modal-overlay" onClick={onClose}>
            <div className="hazop-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="hazop-modal-header">
                    <h2>{selectedDetail.type}</h2>
                    <button className="hazop-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="hazop-modal-body">
                    {selectedDetail.type === 'Nodes' && (
                        <div className="hazop-detail-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.fullDetails.nodes?.map((node, idx) => (
                                <div key={idx} className="hazop-detail-item" style={{ width: '100%' }}>
                                    <div className="hazop-detail-header">
                                        <h3>Node {node.nodeInfo?.nodeNumber}: {node.nodeInfo?.title || node.nodeInfo?.equipment || 'N/A'}</h3>
                                        <span className={`hazop-badge ${node.nodeInfo?.completionStatus ? 'hazop-badge-success' : 'hazop-badge-warning'}`}>
                                            {node.nodeInfo?.completionStatus ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div className="hazop-detail-grid">
                                        <div><strong>Node No:</strong> {node.nodeInfo?.nodeNumber || 'N/A'}</div>
                                        <div><strong>Details Count:</strong> {node.details?.length || 0}</div>
                                        <div><strong>Design Intent:</strong> {node.nodeInfo?.designIntent || 'N/A'}</div>
                                        <div><strong>Status:</strong> {node.nodeInfo?.completionStatus ? 'Complete' : 'Incomplete'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedDetail.type === 'Team Members' && (
                        <div className="hazop-detail-list">
                            {data.fullDetails.teamMembers?.map((member, idx) => (
                                <div key={idx} className="hazop-detail-item">
                                    <div className="hazop-detail-header">
                                        <h3>{member.firstName} {member.lastName}</h3>
                                        <span className="hazop-badge-info">{member.empCode || 'N/A'}</span>
                                    </div>
                                    <div className="hazop-detail-grid">
                                        <div><strong>Email:</strong> {member.emailId || 'N/A'}</div>
                                        <div><strong>Action Taken:</strong> {member.employeeActionTaken ? 'Yes' : 'No'}</div>
                                        <div><strong>Date:</strong> {member.GenerationDate || 'N/A'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedDetail.type === 'Recommendations' && (
                        <div className="hazop-detail-list">
                            {data.recommendations.map((rec, idx) => (
                                <div key={idx} className="hazop-detail-item">
                                    <div className="hazop-detail-header">
                                        <h3>Recommendation {idx + 1}</h3>
                                        <span className={`hazop-badge ${!rec.sendForVerification && rec.sendForVerificationAction === false && rec.sendForVerificationActionStatus ? 'hazop-badge-danger'
                                                : !rec.sendForVerification && rec.sendForVerificationAction === true && rec.sendForVerificationActionStatus ? 'hazop-badge-success'
                                                    : 'hazop-badge-warning'
                                            }`}>
                                            {!rec.sendForVerification && rec.sendForVerificationAction === false && rec.sendForVerificationActionStatus ? 'Rejected'
                                                : !rec.sendForVerification && rec.sendForVerificationAction === true && rec.sendForVerificationActionStatus ? 'Completed'
                                                    : 'Pending'}
                                        </span>

                                    </div>
                                    <div className="hazop-detail-grid">
                                        <div><strong>Description:</strong> {rec.recommendation || 'N/A'}</div>
                                        <div><strong>Remark by Management:</strong> {rec.remarkbyManagement || 'N/A'}</div>
                                        <div><strong>Completion Date:</strong> {formatDate(rec.completionDate) || 'N/A'}</div>
                                        <div><strong>Assigned To:</strong> {rec.verificationResponsibleEmployeeName || 'Unassigned'}</div>
                                        <div><strong>Department:</strong> {rec.department || 'N/A'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedDetail.type === 'Assignments' && (
                        <div className="hazop-detail-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Accepted Section */}
                            <div className="hazop-detail-section">
                                <h3 className="section-title text-green-600">Accepted ({data.assignments.accepted?.length || 0})</h3>
                                {data.assignments.accepted?.map((asg, idx) => (
                                    <div key={idx} className="hazop-detail-item-small" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }}>
                                        <div style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                            <strong>Rec:</strong> {asg.javaHazopNodeRecommendation?.recommendation || 'N/A'}
                                        </div>
                                        <div className="hazop-detail-grid">
                                            <div><strong>Assigned To:</strong> {asg.assignToEmpCode || asg.acceptedByEmployeeName || 'N/A'}</div>
                                            <div><strong>Date:</strong> {asg.assignWorkDate || 'N/A'}</div>
                                            <div><strong>Comments:</strong> {asg.comment || 'None'}</div>
                                            <div><strong>Target Date:</strong> {asg.targetDate || 'N/A'}</div>
                                        </div>
                                    </div>
                                ))}
                                {(!data.assignments.accepted || data.assignments.accepted.length === 0) && <p className="text-gray-500 italic">No accepted assignments.</p>}
                            </div>

                            {/* Pending Section */}
                            <div className="hazop-detail-section">
                                <h3 className="section-title text-blue-600">Assigned / Pending ({data.assignments.assigned?.length || 0})</h3>
                                {data.assignments.assigned?.map((asg, idx) => (
                                    <div key={idx} className="hazop-detail-item-small" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }}>
                                        <div style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                            <strong>Rec:</strong> {asg.javaHazopNodeRecommendation?.recommendation || 'N/A'}
                                        </div>
                                        <div className="hazop-detail-grid">
                                            <div><strong>Assigned To:</strong> {asg.assignToEmpCode || 'N/A'}</div>
                                            <div><strong>Date:</strong> {asg.assignWorkDate || 'N/A'}</div>
                                            <div><strong>Status:</strong> Awaiting Acceptance</div>
                                        </div>
                                    </div>
                                ))}
                                {(!data.assignments.assigned || data.assignments.assigned.length === 0) && <p className="text-gray-500 italic">No pending assignments.</p>}
                            </div>

                            {/* Rejected and Not Assigned sections would go here similarly if needed for full completeness, usually for modal summary */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;