import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader, Search } from 'lucide-react';
import './hazopdashboard.css'; // Ensure this imports the CSS above

// Components
import Overview from './pages/pages/Overview';
import Recommendations from './pages/pages/Recommendations';
import Risks from './pages/pages/Risks';
import DetailModal from './components/components/DetailModal';
import Assignments from './pages/pages/Assignments';
import { useNavigate } from 'react-router-dom';
import { strings } from '../string';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    
    // Local Storage Handling
    const storedHazopRaw = localStorage.getItem("hazopData");
    const storeSingleHazopId = localStorage.getItem("hazopId");
    const storedHazop = storedHazopRaw ? JSON.parse(storedHazopRaw) : null;
    
    const [hazopId, setHazopId] = useState(storeSingleHazopId || storedHazop?.id || '');
    const [tempId, setTempId] = useState(hazopId);
    
    const navigate = useNavigate();
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

    const handleSearch = () => {
        if (tempId.trim() !== '') {
            setHazopId(tempId);
        }
    };

    // Initial Load Logic
    useEffect(() => {
        if (hazopId) setTempId(hazopId);
    }, [hazopId]);

    // Data Fetching
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
            if (!hazopId) {
                setLoading(false);
                return;
            }
            
            setLoading(true);

            const fallbackFullDetails = {
                hazopInfo: { hazopTitle: 'Data Unavailable', site: '-', department: '-', hazopRevisionNo: '-' },
                nodes: [],
                teamMembers: []
            };
            const fallbackAssignments = { accepted: [], rejected: [], assigned: [], notAssigned: [] };

            try {
                const [fullDetails, recommendations, assignments, verificationRecords, mocReferences, activeNodes] = await Promise.all([
                    safeFetch(`http://${strings.localhost}/api/hazopRegistration/${hazopId}/full-details`, fallbackFullDetails),
                    safeFetch(`http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`, []),
                    safeFetch(`http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`, fallbackAssignments),
                    safeFetch(`http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`, []),
                    safeFetch(`http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`, []),
                    safeFetch(`http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`, [])
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

        fetchData();
    }, [hazopId]);

    // Metrics Calculation
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

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!data.fullDetails || !metrics) {
        return (
            <div className="hazop-center-screen">
                <div className="text-center">
                    <AlertCircle style={{ width: 48, height: 48, color: '#dc2626' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Failed to load HAZOP data</p>
                    <button onClick={() => window.location.reload()} className="hazop-retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="hazop-dashboard-container">
            <button className="nd-back-btn" onClick={() => navigate(-1)} style={{ margin: '10px' }}>
                ← Back
            </button>
            
            <DetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                selectedDetail={selectedDetail}
                data={data}
            />

            {/* --- HEADER (Uses Classes now) --- */}
            <div className="hazop-dashboard-header">
                <div className="hazop-max-w">
                    <div className="hazop-header-content">
                        {/* LEFT: Project Info */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h1 className="hazop-title">HAZOP Analytics</h1>
                            <p className="hazop-subtitle">{data.fullDetails.hazopInfo?.hazopTitle || 'N/A'}</p>
                            
                            <div className="hazop-header-meta">
                                <span className="hazop-meta-pill">Site: {data.fullDetails.hazopInfo?.site || 'N/A'}</span>
                                <span>Department: {data.fullDetails.hazopInfo?.department || 'N/A'}</span>
                                <span style={{ width: '4px', height: '4px', background: '#93c5fd', borderRadius: '50%' }}></span>
                                <span>Revision: {data.fullDetails.hazopInfo?.hazopRevisionNo || 'N/A'}</span>
                            </div>
                        </div>

                        {/* RIGHT: Search Control */}
                        <div className="hazop-id-control" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                            <label style={{ color: '#dbeafe', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                HAZOP ID
                            </label>

                            <div className="hazop-search-wrapper">
                                <input
                                    // type="text"
                                    className="hazop-search-input"
                                    value={tempId}
                                    onChange={(e) => setTempId(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                    placeholder="Enter ID..."
                                />
                                <button className="hazop-search-btn" onClick={handleSearch}>
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="hazop-tabs-container">
                <div className="hazop-max-w">
                    <div className="hazop-tabs-list">
                        {['overview', 'recommendations', 'assignments', 'risks'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`hazop-tab-button ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="hazop-max-w hazop-p-6">
                {activeTab === 'overview' && <Overview metrics={metrics} data={data} openDetailModal={openDetailModal} />}
                {activeTab === 'recommendations' && <Recommendations metrics={metrics} nodes={data.fullDetails?.nodes} />}
                {activeTab === 'assignments' && <Assignments metrics={metrics} assignments={data.assignments} />}
                {activeTab === 'risks' && <Risks metrics={metrics} nodes={data.fullDetails.nodes} />}
            </div>
        </div>
    );
};

export default Dashboard;