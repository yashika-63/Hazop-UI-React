
import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader, Search } from 'lucide-react';
import './hazopdashboard.css';


// Components
import Overview from './pages/pages/Overview';
import Recommendations from './pages/pages/Recommendations';
import Risks from './pages/pages/Risks';
import DetailModal from './components/components/DetailModal';
import Assignments from './pages/pages/Assignments';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // --- SEARCH LOGIC FIX ---
    const [hazopId, setHazopId] = useState('1'); // This triggers the API
    const [tempId, setTempId] = useState('1');   // This handles typing input

    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // State to hold all fetched data
    const [data, setData] = useState({
        fullDetails: null,
        recommendations: [],
        assignments: null,
        verificationRecords: [],
        mocReferences: [],
        activeNodes: []
    });

    // Function to trigger search
    const handleSearch = () => {
        if (tempId.trim() !== '') {
            setHazopId(tempId);
        }
    };

    useEffect(() => {
        const safeFetch = (url, fallbackValue) => {
            return fetch(url)
                .then(response => {
                    if (!response.ok) return fallbackValue;
                    return response.text().then(text => {
                        try {
                            return text ? JSON.parse(text) : fallbackValue;
                        } catch (e) {
                            return fallbackValue;
                        }
                    });
                })
                .catch(() => fallbackValue);
        };

        const fetchData = async () => {
            setLoading(true);

            const fallbackFullDetails = {
                hazopInfo: { hazopTitle: 'Data Unavailable', site: '-', department: '-', hazopRevisionNo: '-' },
                nodes: [],
                teamMembers: []
            };
            const fallbackAssignments = { accepted: [], rejected: [], assigned: [], notAssigned: [] };

            try {
                const [fullDetails, recommendations, assignments, verificationRecords, mocReferences, activeNodes] = await Promise.all([
                    safeFetch(`http://localhost:5559/api/hazopRegistration/${hazopId}/full-details`, fallbackFullDetails),
                    safeFetch(`http://localhost:5559/api/nodeRecommendation/getByHazopRegistration/${hazopId}`, []),
                    safeFetch(`http://localhost:5559/api/recommendation/assign/getAllByRegistration/${hazopId}`, fallbackAssignments),
                    safeFetch(`http://localhost:5559/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`, []),
                    safeFetch(`http://localhost:5559/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`, []),
                    safeFetch(`http://localhost:5559/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`, [])
                ]);

                setData({
                    fullDetails,
                    recommendations: Array.isArray(recommendations) ? recommendations : [],
                    assignments: assignments || fallbackAssignments,
                    verificationRecords: Array.isArray(verificationRecords) ? verificationRecords : [],
                    mocReferences: Array.isArray(mocReferences) ? mocReferences : [],
                    activeNodes: Array.isArray(activeNodes) ? activeNodes : []
                });
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (hazopId) fetchData();
    }, [hazopId]);

    // Calculate metrics
    const metrics = useMemo(() => {
        if (!data.fullDetails) return null;

        const totalRecommendations = data.recommendations.length;
        const completedRecommendations = data.recommendations.filter(r => r.completionStatus === true).length;
        const completionRate = totalRecommendations > 0 ? (completedRecommendations / totalRecommendations * 100).toFixed(1) : 0;

        const asgn = data.assignments || { accepted: [], rejected: [], assigned: [], notAssigned: [] };
        const rejectedCount = asgn.rejected?.length || 0;
        const acceptedCount = asgn.accepted?.length || 0;
        const assignedCount = asgn.assigned?.length || 0;
        const notAssignedCount = asgn.notAssigned?.length || 0;

        const totalAssignments = rejectedCount + acceptedCount + assignedCount + notAssignedCount;
        const assignmentRate = totalAssignments > 0 ? ((totalAssignments - notAssignedCount) / totalAssignments * 100).toFixed(1) : 0;
        const acceptanceRate = (acceptedCount + assignedCount) > 0 ? (acceptedCount / (acceptedCount + assignedCount + rejectedCount) * 100).toFixed(1) : 0;
        const verificationRate = totalRecommendations > 0 ? (data.verificationRecords.length / totalRecommendations * 100).toFixed(1) : 0;

        const totalNodes = data.fullDetails.nodes?.length || 0;
        const activeNodeCount = data.activeNodes.length;
        const completedNodes = data.fullDetails.nodes?.filter(n => n.nodeInfo?.completionStatus === true).length || 0;
        const nodeCompletionRate = totalNodes > 0 ? (completedNodes / totalNodes * 100).toFixed(1) : 0;

        let highRisk = 0, mediumRisk = 0, lowRisk = 0;
        data.fullDetails.nodes?.forEach(node => {
            node.details?.forEach(detail => {
                const risk = detail.detailInfo?.riskRating || 0;
                if (risk >= 15) highRisk++;
                else if (risk >= 8) mediumRisk++;
                else lowRisk++;
            });
        });

        return {
            totalRecommendations, completedRecommendations, completionRate,
            totalAssignments, assignmentRate, acceptanceRate, verificationRate,
            totalNodes, activeNodeCount, completedNodes, nodeCompletionRate,
            rejectedCount, acceptedCount, assignedCount, notAssignedCount,
            highRisk, mediumRisk, lowRisk
        };
    }, [data]);

    const openDetailModal = (type, dataContent) => {
        setSelectedDetail({ type, data: dataContent });
        setDetailModalOpen(true);
    };



    if (!data.fullDetails || !metrics) {
        return (
            <div className="hazop-center-screen">
                <div className="text-center">
                    <AlertCircle style={{ width: 48, height: 48, color: '#dc2626', margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: '#4b5563' }}>Failed to load HAZOP data</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (

        <div className="hazop-dashboard-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <DetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                selectedDetail={selectedDetail}
                data={data}
            />

            {/* --- IMPROVED DASHBOARD HEADER --- */}
            <div className="hazop-dashboard-header" style={{
                background: 'linear-gradient(120deg, #1e3a8a 0%, #3b82f6 100%)',
                padding: '2.5rem 0 3.5rem',
                marginBottom: '2rem',
                borderBottomLeftRadius: '32px',
                borderBottomRightRadius: '32px',
                boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.25)',
                position: 'relative',
                zIndex: 1
            }}>
                <div className="max-w-7xl">
                    <div className="hazop-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 2rem', gap: '2rem', flexWrap: 'wrap' }}>

                        {/* LEFT: Project Info */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0.1rem', color: 'white' }}>
                                HAZOP Analytics
                            </h1>
                            <p className="hazop-header-subtitle" style={{ color: '#bfdbfe', fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>
                                {data.fullDetails.hazopInfo?.hazopTitle || 'N/A'}
                            </p>
                            <div className="hazop-header-meta" style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'white', marginTop: '1.25rem', alignItems: 'center', opacity: 0.9 }}>
                                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                                    Site: {data.fullDetails.hazopInfo?.site || 'N/A'}
                                </span>
                                <span>Department: {data.fullDetails.hazopInfo?.department || 'N/A'}</span>
                                <span style={{ width: '4px', height: '4px', background: '#93c5fd', borderRadius: '50%' }}></span>
                                <span>Revision: {data.fullDetails.hazopInfo?.hazopRevisionNo || 'N/A'}</span>
                            </div>
                        </div>

                        {/* RIGHT: Search Control */}
                        <div className="hazop-id-control" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                            <label className="text-sm" style={{ color: '#dbeafe', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                HAZOP ID
                            </label>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                borderRadius: '12px',
                                padding: '4px 4px 4px 16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                width: '220px',
                                transition: 'all 0.2s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                                }}
                            >
                                <input
                                    type="text"
                                    value={tempId}
                                    onChange={(e) => setTempId(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    placeholder="Enter ID..."
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        width: '100%',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    onClick={handleSearch}
                                    style={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1e3a8a',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {/* <div className="hazop-tabs-container">
                <div className="max-w-7xl">
                    <div className="hazop-tabs-list">
                        {['overview', 'recommendations', 'assignments', 'risks'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div> */}
            <div className="hazop-tabs-container">
                <div className="hazop-max-w"> {/* CHANGED: max-w-7xl -> hazop-max-w */}
                    <div className="hazop-tabs-list"> {/* CHANGED: tabs-list -> hazop-tabs-list */}
                        {['overview', 'recommendations', 'assignments', 'risks'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                // CHANGED: tab-button -> hazop-tab-button
                                className={`hazop-tab-button ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>



            {/* Tab Content */}
            {/* <div className="max-w-7xl p-6">
                {activeTab === 'overview' && (
                    <Overview
                        metrics={metrics}
                        data={data}
                        openDetailModal={openDetailModal}
                    />
                )}

                {activeTab === 'recommendations' && (
                    <Recommendations
                        metrics={metrics}
                        recommendations={data.recommendations}
                        nodes={data.fullDetails?.nodes}
                    />
                )}

                {activeTab === 'assignments' && (
                    <Assignments
                        metrics={metrics}
                        assignments={data.assignments}
                    />
                )}

                {activeTab === 'risks' && (
                    <Risks
                        metrics={metrics}
                        nodes={data.fullDetails.nodes}
                    />
                )}
            </div> */}


            <div className="hazop-max-w hazop-p-6">
                {activeTab === 'overview' && (
                    <Overview metrics={metrics} data={data} openDetailModal={openDetailModal} />
                )}
                {activeTab === 'recommendations' && (
                    <Recommendations metrics={metrics} nodes={data.fullDetails?.nodes} />
                )}
                {activeTab === 'assignments' && (
                    <Assignments metrics={metrics} assignments={data.assignments} />
                )}
                {activeTab === 'risks' && (
                    <Risks metrics={metrics} nodes={data.fullDetails.nodes} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;