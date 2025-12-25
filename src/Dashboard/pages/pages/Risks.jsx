import React, { useState, useMemo } from 'react';
import {
    AlertTriangle, Shield, TrendingDown, CheckCircle, Clock, Filter,
    AlertOctagon, LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react';

const Risks = ({ metrics, nodes }) => {
    const [riskFilter, setRiskFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('card');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const allRisks = useMemo(() => {
        if (!nodes) return [];
        const flatList = nodes.flatMap(node =>
            node.details?.map(detail => {
                const totalRecs = detail.recommendations?.length || 0;
                const completedRecs = detail.recommendations?.filter(r => r.completionStatus).length || 0;
                const isMitigated = totalRecs > 0 && totalRecs === completedRecs;
                return { ...detail, nodeNumber: node.nodeInfo?.nodeNumber, equipment: node.nodeInfo?.equipment, isMitigated };
            }) || []
        );
        return flatList.sort((a, b) => (b.detailInfo?.riskRating || 0) - (a.detailInfo?.riskRating || 0));
    }, [nodes]);

    const filteredRisks = useMemo(() => {
        return allRisks.filter(item => {
            const score = item.detailInfo?.riskRating || 0;
            if (riskFilter === 'HIGH') return score >= 15;
            if (riskFilter === 'MEDIUM') return score >= 8 && score < 15;
            if (riskFilter === 'LOW') return score < 8;
            return true;
        });
    }, [allRisks, riskFilter]);

    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
    const paginatedRisks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRisks.slice(start, start + itemsPerPage);
    }, [filteredRisks, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            document.getElementById('risk-list-top')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getRiskConfig = (score) => {
        if (score >= 15) return { color: '#ef4444', bg: '#fef2f2', label: 'High', border: '#fca5a5' };
        if (score >= 8) return { color: '#f59e0b', bg: '#fffbeb', label: 'Medium', border: '#fcd34d' };
        return { color: '#10b981', bg: '#f0fdf4', label: 'Low', border: '#86efac' };
    };

    const styles = {
        container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
        summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
        countCard: (color, bg, border, type) => ({
            padding: '1.25rem', borderRadius: '12px', backgroundColor: riskFilter === type ? 'var(--bg-card)' : 'var(--bg-row-even)', 
            border: `1px solid ${border}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            transform: riskFilter === type ? 'scale(1.03)' : 'scale(1)',
            boxShadow: riskFilter === type ? `0 4px 12px ${color}33` : 'none',
            opacity: riskFilter !== 'ALL' && riskFilter !== type ? 0.6 : 1
        }),
        toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
        toggleGroup: { display: 'flex', background: 'var(--bg-row-even)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' },
        toggleBtn: (isActive) => ({
            padding: '6px 10px', border: 'none', background: isActive ? 'var(--bg-card)' : 'transparent',
            borderRadius: '6px', color: isActive ? '#3b82f6' : 'var(--text-secondary)', cursor: 'pointer',
            boxShadow: isActive ? '0 1px 2px var(--shadow-color)' : 'none', display: 'flex', alignItems: 'center'
        }),
        card: { backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px var(--shadow-color)' },
        cardHeader: { padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-header)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        cardBody: { padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: '2rem' },
        tableWrapper: { backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
        th: { padding: '1rem', textAlign: 'left', background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' },
        td: { padding: '1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'top', color: 'var(--text-main)' },
        pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
        pageBtn: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' },
        label: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' },
        text: { fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1rem' },
        riskBadge: (config, isTarget) => ({
            padding: '0.75rem', borderRadius: '10px',
            backgroundColor: isTarget ? 'var(--bg-card)' : config.bg,
            border: isTarget ? `1px dashed ${config.border}` : `1px solid ${config.border}`,
            textAlign: 'center', minWidth: '80px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.summaryGrid}>
                <div style={styles.countCard('#dc2626', '#fef2f2', '#fecaca', 'HIGH')} onClick={() => setRiskFilter(riskFilter === 'HIGH' ? 'ALL' : 'HIGH')}>
                    <h4 style={{ color: '#991b1b', margin: 0 }}>High Risks</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: '0.5rem 0 0' }}>{metrics.highRisk}</p>
                </div>
                <div style={styles.countCard('#ea580c', '#fff7ed', '#fed7aa', 'MEDIUM')} onClick={() => setRiskFilter(riskFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}>
                    <h4 style={{ color: '#9a3412', margin: 0 }}>Medium Risks</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', margin: '0.5rem 0 0' }}>{metrics.mediumRisk}</p>
                </div>
                <div style={styles.countCard('#16a34a', '#f0fdf4', '#bbf7d0', 'LOW')} onClick={() => setRiskFilter(riskFilter === 'LOW' ? 'ALL' : 'LOW')}>
                    <h4 style={{ color: '#166534', margin: 0 }}>Low Risks</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '0.5rem 0 0' }}>{metrics.lowRisk}</p>
                </div>
            </div>

            <div id="risk-list-top" style={styles.toolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <AlertOctagon size={18} />
                    <strong>{filteredRisks.length}</strong> Risks Found
                    {riskFilter !== 'ALL' && <span style={{ background: 'var(--bg-row-even)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{riskFilter}</span>}
                </div>
                <div style={styles.toggleGroup}>
                    <button style={styles.toggleBtn(viewMode === 'card')} onClick={() => setViewMode('card')} title="Card View"><LayoutGrid size={18} /></button>
                    <button style={styles.toggleBtn(viewMode === 'table')} onClick={() => setViewMode('table')} title="Table View"><List size={18} /></button>
                </div>
            </div>

            {viewMode === 'card' ? (
                <div>
                    {paginatedRisks.map((item, idx) => {
                        const initialConfig = getRiskConfig(item.detailInfo?.riskRating);
                        const residualConfig = getRiskConfig(item.detailInfo?.additionalRiskRating);
                        return (
                            <div key={idx} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ background: 'var(--bg-row-even)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Node {item.nodeNumber}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.equipment}</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.detailInfo?.guidWord} {item.detailInfo?.specificParameter}</span>
                                </div>
                                <div style={styles.cardBody}>
                                    <div>
                                        <span style={styles.label}>Deviation</span>
                                        <p style={{ ...styles.text, fontWeight: 600 }}>{item.detailInfo?.deviation}</p>
                                        <span style={styles.label}>Causes & Consequences</span>
                                        <p style={styles.text}>{item.detailInfo?.causes}<br /><br />{item.detailInfo?.consequences}</p>
                                    </div>
                                    <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 1.5rem' }}>
                                        <span style={styles.label}>Existing Safeguards</span>
                                        <p style={{ ...styles.text, fontSize: '0.85rem' }}>{item.detailInfo?.existineControl || 'None'}</p>
                                        <span style={{ ...styles.label, color: '#2563eb' }}>Recommendations</span>
                                        <ul style={{ paddingLeft: '1rem', margin: 0, color: 'var(--text-main)' }}>{item.recommendations?.map(r => <li key={r.id} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{r.recommendation}</li>)}</ul>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                                        <div style={styles.riskBadge(initialConfig, false)}>
                                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: initialConfig.color, marginBottom: '2px', textTransform: 'uppercase' }}>Initial</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: initialConfig.color }}>{item.detailInfo?.riskRating}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}><TrendingDown size={20} /></div>
                                        <div style={styles.riskBadge(residualConfig, !item.isMitigated)}>
                                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: item.isMitigated ? '#16a34a' : '#ea580c', marginBottom: '2px', textTransform: 'uppercase' }}>{item.isMitigated ? 'Final' : 'Target'}</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: item.isMitigated ? residualConfig.color : '#cbd5e1' }}>{item.detailInfo?.additionalRiskRating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Node / Deviation</th>
                                <th style={styles.th}>Initial Risk</th>
                                <th style={styles.th}>Safeguards & Recommendations</th>
                                <th style={styles.th}>Target Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRisks.map((item, idx) => {
                                const initialConfig = getRiskConfig(item.detailInfo?.riskRating);
                                const residualConfig = getRiskConfig(item.detailInfo?.additionalRiskRating);
                                return (
                                    <tr key={idx}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600 }}>Node {item.nodeNumber}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{item.equipment}</div>
                                            <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{item.detailInfo?.deviation}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.riskBadge(initialConfig, false)}>
                                                <span style={{ fontWeight: 700, color: initialConfig.color }}>{item.detailInfo?.riskRating}</span>
                                                <div style={{ fontSize: '0.7rem' }}>{initialConfig.label}</div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}><strong>Controls:</strong> {item.detailInfo?.existineControl}</div>
                                            <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.8rem', color: '#2563eb' }}>{item.recommendations?.map(r => <li key={r.id}>{r.recommendation}</li>)}</ul>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.riskBadge(residualConfig, !item.isMitigated)}>
                                                <span style={{ fontWeight: 700, color: item.isMitigated ? residualConfig.color : '#cbd5e1' }}>{item.detailInfo?.additionalRiskRating}</span>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: item.isMitigated ? '#16a34a' : '#ea580c' }}>{item.isMitigated ? 'ACHIEVED' : 'PENDING'}</div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }} disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft size={16} /> Prev</button>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Page {currentPage} of {totalPages}</span>
                    <button style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }} disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next <ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
};

export default Risks;