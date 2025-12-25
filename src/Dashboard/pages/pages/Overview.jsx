import React, { useMemo } from 'react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Users, FileText, Activity, TrendingDown } from 'lucide-react';
import StatCard from '../../components/components/StatCard'; // Ensure this uses variables internally too!

const RiskAnalysisChart = ({ nodes }) => {
    
    // 1. Calculate Averages
    const riskData = useMemo(() => {
        if (!nodes) return [];
        let totalInitial = 0;
        let totalFinal = 0;
        let count = 0;
        nodes.forEach(node => {
            node.details?.forEach(detail => {
                const info = detail.detailInfo;
                totalInitial += info.riskRating || 0;
                totalFinal += info.additionalRiskRating || 0;
                count++;
            });
        });
        if (count === 0) return [];
        return [
            { name: 'Initial Risk', value: parseFloat((totalInitial / count).toFixed(1)), fill: 'url(#initialRiskGrad)' },
            { name: 'Final Risk', value: parseFloat((totalFinal / count).toFixed(1)), fill: 'url(#finalRiskGrad)' }
        ];
    }, [nodes]);

    const reductionStats = useMemo(() => {
        if (riskData.length < 2) return 0;
        const initial = riskData[0].value;
        const final = riskData[1].value;
        return initial > 0 ? Math.round(((initial - final) / initial) * 100) : 0;
    }, [riskData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px', fontSize: '12px' }}>{data.name}</p>
                    <p style={{ color: data.name.includes('Initial') ? '#ef4444' : '#10b981', fontWeight: '800', fontSize: '16px', margin: 0 }}>
                        Avg Score: {data.value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className='hazop-chart-card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 className="hazop-chart-title" style={{ margin: 0 }}>Risk Reduction</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Average Risk Score (Lower is better)</p>
                </div>
                {reductionStats > 0 && (
                    <div style={{ background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #d1fae5' }}>
                        <TrendingDown size={16} color="#059669" />
                        <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: '700' }}>{reductionStats}% Reduction</span>
                    </div>
                )}
            </div>
            
            <div style={{ height: 300, width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} barCategoryGap="20%">
                        <defs>
                            <linearGradient id="initialRiskGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6}/>
                            </linearGradient>
                            <linearGradient id="finalRiskGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Avg Risk Score', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: '11px' } }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-row-even)' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60} animationDuration={1500}>
                            {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Overview = ({ metrics, data, openDetailModal }) => {
    const assignmentDistribution = useMemo(() => {
        if (!metrics) return [];
        return [
            { name: 'Accepted', value: metrics.acceptedCount, color: '#10b981' },
            { name: 'Assigned', value: metrics.assignedCount, color: '#3b82f6' },
            { name: 'Rejected', value: metrics.rejectedCount, color: '#ef4444' },
            { name: 'Not Assigned', value: metrics.notAssignedCount, color: '#6b7280' }
        ].filter(item => item.value > 0);
    }, [metrics]);

    const recommendationStatus = useMemo(() => {
        if (!metrics) return [];
        return [
            { name: 'Completed', value: metrics.completedRecommendations, color: '#10b981' },
            { name: 'Pending', value: metrics.totalRecommendations - metrics.completedRecommendations, color: '#f59e0b' }
        ].filter(item => item.value > 0);
    }, [metrics]);

    const tooltipStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--text-main)'
    };

    return (
        <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Stats Grid */}
            <div className="hazop-stats-grid">
                <StatCard icon={FileText} title="Total Nodes" value={metrics.totalNodes} subtitle={`${metrics.activeNodeCount} active, ${metrics.completedNodes} completed`} color="text-blue-600" onClick={() => openDetailModal('Nodes', data.fullDetails.nodes)} />
                <StatCard icon={Users} title="Team Members" value={data.fullDetails.teamMembers?.length || 0} subtitle="Active participants" color="text-green-600" onClick={() => openDetailModal('Team Members', data.fullDetails.teamMembers)} />
                <StatCard icon={CheckCircle} title="Completion Rate" value={`${metrics.completionRate}%`} subtitle={`${metrics.completedRecommendations}/${metrics.totalRecommendations} completed`} color="text-purple-600" onClick={() => openDetailModal('Recommendations', data.recommendations)} />
                <StatCard icon={AlertCircle} title="Pending Actions" value={metrics.totalRecommendations - metrics.completedRecommendations} subtitle={`${metrics.notAssignedCount} unassigned`} color="text-orange-600" onClick={() => openDetailModal('Assignments', data.assignments)} />
            </div>

            {/* Middle Charts Grid */}
            <div className="hazop-charts-horizontal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {assignmentDistribution.length > 0 && (
                    <div className="hazop-chart-card">
                        <h3 className="hazop-chart-title">Assignment Distribution</h3>
                        <div style={{ height: '300px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={assignmentDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" cornerRadius={6}>
                                        {assignmentDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{metrics.totalAssignments}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assignments</div>
                            </div>
                        </div>
                    </div>
                )}

                {recommendationStatus.length > 0 && (
                    <div className="hazop-chart-card">
                        <h3 className="hazop-chart-title">Recommendation Status</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={recommendationStatus} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                                        {recommendationStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {data.fullDetails?.nodes && <RiskAnalysisChart nodes={data.fullDetails.nodes} />}
            </div>

            {/* Bottom Progress Stats */}
            <div className="hazop-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="hazop-chart-card">
                    <div className="hazop-stat-header">
                        <h4 className="hazop-stat-title">Assignment Rate</h4>
                        <Activity style={{ width: 20, height: 20, color: '#2563eb' }} />
                    </div>
                    <div className="stat-value text-blue-600" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{metrics.assignmentRate}%</div>
                    <div className="hazop-progress-container">
                        <div className="hazop-progress-bar" style={{ width: `${metrics.assignmentRate}%`, backgroundColor: '#2563eb' }} />
                    </div>
                </div>
                <div className="hazop-chart-card">
                    <div className="hazop-stat-header">
                        <h4 className="hazop-stat-title">Acceptance Rate</h4>
                        <CheckCircle style={{ width: 20, height: 20, color: '#16a34a' }} />
                    </div>
                    <div className="hazop-stat-value text-green-600" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{metrics.acceptanceRate}%</div>
                    <div className="hazop-progress-container">
                        <div className="hazop-progress-bar" style={{ width: `${metrics.acceptanceRate}%`, backgroundColor: '#16a34a' }} />
                    </div>
                </div>
                <div className="hazop-chart-card">
                    <div className="hazop-stat-header">
                        <h4 className="hazop-stat-title">Verification Rate</h4>
                        <Clock style={{ width: 20, height: 20, color: '#9333ea' }} />
                    </div>
                    <div className="hazop-stat-value text-purple-600" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{metrics.verificationRate}%</div>
                    <div className="hazop-progress-container">
                        <div className="hazop-progress-bar" style={{ width: `${metrics.verificationRate}%`, backgroundColor: '#9333ea' }} />
                    </div>
                </div>
            </div>

            {data.mocReferences.length > 0 && (
                <div className="hazop-chart-card">
                    <h3 className="hazop-chart-title">MOC References ({data.mocReferences.length})</h3>
                    <div className="space-y-2">
                        {data.mocReferences.map(moc => (
                            <div key={moc.id} className="hazop-moc-item">
                                <p className="hazop-moc-title">{moc.mocTitle}</p>
                                <p className="hazop-moc-meta">MOC No: {moc.mocNo} | Plant: {moc.mocPlant}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;