import React, { useState, useMemo, useRef } from 'react';
import { CheckCircle, Clock, ArrowDown, Filter, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

const Recommendations = ({ metrics, nodes }) => {
    const [filterStatus, setFilterStatus] = useState('ALL'); 
    const [selectedNodeFilter, setSelectedNodeFilter] = useState('ALL'); 
    const scrollContainerRef = useRef(null);

    const scrollNav = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const filteredNodes = useMemo(() => {
        if (!nodes) return [];
        let result = nodes;
        if (selectedNodeFilter !== 'ALL') {
            result = result.filter(n => n.nodeInfo?.nodeNumber === selectedNodeFilter);
        }
        if (filterStatus === 'ALL') return result;
        return result.map(node => {
            const matchingDetails = node.details?.map(detail => {
                const matchingRecs = detail.recommendations?.filter(rec => {
                    if (filterStatus === 'COMPLETED') return rec.completionStatus === true;
                    if (filterStatus === 'PENDING') return rec.completionStatus === false;
                    return true;
                });
                if (matchingRecs && matchingRecs.length > 0) return { ...detail, recommendations: matchingRecs };
                return null;
            }).filter(Boolean);
            if (matchingDetails && matchingDetails.length > 0) return { ...node, details: matchingDetails };
            return null;
        }).filter(Boolean);
    }, [nodes, filterStatus, selectedNodeFilter]);

    const styles = {
        container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
        summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
        countCard: (isActive, type) => ({
            padding: '1.5rem', borderRadius: '12px', border: '1px solid', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s ease', transform: isActive ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isActive ? '0 4px 12px var(--shadow-color)' : 'none',
            borderColor: isActive ? (type === 'total' ? '#3b82f6' : type === 'success' ? '#16a34a' : '#ea580c') : 'var(--border-color)',
            backgroundColor: isActive ? 'var(--bg-card)' : 'var(--bg-row-even)'
        }),
        countValue: { fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: 'var(--text-main)' },
        countLabel: { margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' },

        navBarContainer: {
            position: 'sticky', top: 0, zIndex: 10,
            background: 'var(--bg-body)', backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0',
            marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
        },
        fixedSection: { paddingRight: '0.75rem', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' },
        scrollSection: { display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth', flex: 1, alignItems: 'center' },
        scrollControls: { display: 'flex', gap: '0.25rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' },
        controlBtn: {
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px',
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s'
        },
        navButton: (isActive) => ({
            padding: '0.5rem 1rem', borderRadius: '20px', 
            border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
            backgroundColor: isActive ? '#eff6ff' : 'var(--bg-card)', 
            color: isActive ? '#1d4ed8' : 'var(--text-secondary)', 
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', 
            transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '6px'
        }),

        nodeBlock: { backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease-out' },
        nodeHeader: { backgroundColor: 'var(--bg-header)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        nodeTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' },
        
        detailBlock: { padding: '1.5rem', borderBottom: '1px solid var(--border-color)' },
        detailHeader: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' },
        indexBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' },
        deviationTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0' },
        discussionText: { fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 },
        
        recList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginLeft: '3rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' },
        recCard: { display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-row-even)' },
        recIndex: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', minWidth: '3.5rem' },
        recContent: { flex: 1 },
        recText: { fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500', marginBottom: '0.5rem' },
        metaGrid: { display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' },
        
        statusBadge: (completed) => ({
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
            backgroundColor: completed ? '#dcfce7' : '#fff7ed',
            color: completed ? '#166534' : '#c2410c',
            display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }),
        emptyState: { padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '2px dashed var(--border-color)' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.summaryGrid}>
                <div style={styles.countCard(filterStatus === 'ALL', 'total')} onClick={() => setFilterStatus('ALL')}>
                    <h4 style={styles.countLabel}>Total Recommendations</h4>
                    <p style={styles.countValue}>{metrics.totalRecommendations}</p>
                </div>
                <div style={styles.countCard(filterStatus === 'COMPLETED', 'success')} onClick={() => setFilterStatus('COMPLETED')}>
                    <h4 style={{...styles.countLabel, color: '#16a34a'}}>Completed</h4>
                    <p style={{...styles.countValue, color: '#16a34a'}}>{metrics.completedRecommendations}</p>
                </div>
                <div style={styles.countCard(filterStatus === 'PENDING', 'pending')} onClick={() => setFilterStatus('PENDING')}>
                    <h4 style={{...styles.countLabel, color: '#ea580c'}}>Pending</h4>
                    <p style={{...styles.countValue, color: '#ea580c'}}>{metrics.totalRecommendations - metrics.completedRecommendations}</p>
                </div>
            </div>

            {nodes && nodes.length > 0 && (
                <div style={styles.navBarContainer}>
                    <div style={styles.fixedSection}>
                        <button style={styles.navButton(selectedNodeFilter === 'ALL')} onClick={() => setSelectedNodeFilter('ALL')}>
                            <Layers size={14} /> All Nodes
                        </button>
                    </div>
                    <div ref={scrollContainerRef} style={styles.scrollSection} className="hazop-no-scrollbar">
                        {nodes.map((node) => (
                            <button key={node.nodeInfo?.id} style={styles.navButton(selectedNodeFilter === node.nodeInfo?.nodeNumber)} onClick={() => setSelectedNodeFilter(node.nodeInfo?.nodeNumber)}>
                                Node {node.nodeInfo?.nodeNumber}
                            </button>
                        ))}
                    </div>
                    <div style={styles.scrollControls}>
                        <button style={styles.controlBtn} onClick={() => scrollNav('left')}><span style={{ fontSize: '12px', lineHeight: 1 }}>◀️</span></button>
                        <button style={styles.controlBtn} onClick={() => scrollNav('right')}><span style={{ fontSize: '12px', lineHeight: 1 }}>▶️</span></button>
                    </div>
                </div>
            )}

            <div>
                {filteredNodes && filteredNodes.length > 0 ? (
                    filteredNodes.map((node, nodeIdx) => {
                        const nodeIndex = node.nodeInfo?.nodeNumber || nodeIdx + 1;
                        return (
                            <div key={node.nodeInfo?.id || nodeIdx} style={styles.nodeBlock}>
                                <div style={styles.nodeHeader}>
                                    <h3 style={styles.nodeTitle}>Node {nodeIndex}: {node.nodeInfo?.equipment || 'Unknown Equipment'}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{node.details.length} Deviations</span>
                                </div>
                                {node.details.map((detail, detailIdx) => {
                                    const detailIndex = `${nodeIndex}.${detailIdx + 1}`;
                                    const hasRecs = detail.recommendations && detail.recommendations.length > 0;
                                    return (
                                        <div key={detail.detailInfo?.id || detailIdx} style={styles.detailBlock}>
                                            <div style={styles.detailHeader}>
                                                <span style={styles.indexBadge}>{detailIndex}</span>
                                                <div>
                                                    <h4 style={styles.deviationTitle}>{detail.detailInfo?.guidWord} {detail.detailInfo?.specificParameter} <span style={{fontWeight: 400, color: 'var(--text-muted)'}}> — {detail.detailInfo?.deviation}</span></h4>
                                                    <p style={styles.discussionText}><strong>Consequence:</strong> {detail.detailInfo?.consequences || 'None defined'}</p>
                                                </div>
                                            </div>
                                            {hasRecs ? (
                                                <div style={styles.recList}>
                                                    {detail.recommendations.map((rec, recIdx) => {
                                                        const recIndex = `${detailIndex}.${recIdx + 1}`;
                                                        return (
                                                            <div key={rec.id || recIdx} style={styles.recCard}>
                                                                <div style={styles.recIndex}>{recIndex}</div>
                                                                <div style={styles.recContent}>
                                                                    <div style={styles.recText}>{rec.recommendation}</div>
                                                                    <div style={styles.metaGrid}>
                                                                        <span><strong>Priority:</strong> {rec.priority || 'Medium'}</span>
                                                                        <span>•</span>
                                                                        <span><strong>Assigned To:</strong> {rec.assignedTo || 'Unassigned'}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span style={styles.statusBadge(rec.completionStatus)}>
                                                                        {rec.completionStatus ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                                                        {rec.completionStatus ? 'Done' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div style={{ marginLeft: '3rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recommendations match this filter.</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.emptyState}>
                        <ArrowDown size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h3>No recommendations match the filter "{filterStatus}"</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;