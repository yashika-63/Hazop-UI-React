import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, CheckCircle, AlertCircle, XCircle, HelpCircle, 
    LayoutGrid, Clock, List, ChevronDown 
} from 'lucide-react';

const Assignments = ({ metrics, assignments }) => {
    const [activeTab, setActiveTab] = useState('ALL'); 
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredTab, setHoveredTab] = useState(null);

    const filterBySearch = (list) => {
        if (!list) return [];
        if (!searchTerm) return list;
        const lowerTerm = searchTerm.toLowerCase();
        return list.filter(item => {
            const recText = item.javaHazopNodeRecommendation?.recommendation || item.recommendation || '';
            const assignee = item.assignToEmpCode || item.acceptedByEmployeeName || '';
            const comment = item.comment || '';
            return recText.toLowerCase().includes(lowerTerm) || 
                   assignee.toLowerCase().includes(lowerTerm) ||
                   comment.toLowerCase().includes(lowerTerm);
        });
    };

    const filteredData = useMemo(() => ({
        accepted: filterBySearch(assignments.accepted),
        assigned: filterBySearch(assignments.assigned),
        rejected: filterBySearch(assignments.rejected),
        notAssigned: filterBySearch(assignments.notAssigned),
    }), [assignments, searchTerm]);

    const totalCount = 
        filteredData.accepted.length + 
        filteredData.assigned.length + 
        filteredData.rejected.length + 
        filteredData.notAssigned.length;

    const getCurrentList = () => {
        if (activeTab === 'ALL') {
            return [
                ...filteredData.accepted.map(i => ({...i, statusType: 'accepted'})),
                ...filteredData.assigned.map(i => ({...i, statusType: 'assigned'})),
                ...filteredData.rejected.map(i => ({...i, statusType: 'rejected'})),
                ...filteredData.notAssigned.map(i => ({...i, statusType: 'notAssigned'}))
            ];
        }
        const list = filteredData[activeTab === 'ACCEPTED' ? 'accepted' : 
                                  activeTab === 'ASSIGNED' ? 'assigned' :
                                  activeTab === 'REJECTED' ? 'rejected' : 'notAssigned'];
        const typeMap = { ACCEPTED: 'accepted', ASSIGNED: 'assigned', REJECTED: 'rejected', NOT_ASSIGNED: 'notAssigned' };
        return list.map(i => ({...i, statusType: typeMap[activeTab]}));
    };

    const TabButton = ({ id, label, count, color, icon: Icon }) => {
        const isActive = activeTab === id;
        const isHovered = hoveredTab === id;
        return (
            <button
                onClick={() => setActiveTab(id)}
                onMouseEnter={() => setHoveredTab(id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                    ...styles.tabButton,
                    ...(isActive ? styles.tabActive : {}),
                    ...(isHovered && !isActive ? styles.tabHover : {}),
                    borderBottom: isActive ? `3px solid ${color}` : '3px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-secondary)'
                }}
            >
                <Icon size={16} color={isActive ? color : 'var(--text-muted)'} />
                {label}
                <span style={styles.badge}>{count}</span>
            </button>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.controlsHeader}>
                <div style={styles.searchContainer}>
                    <Search style={styles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search assignments, employees..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={styles.viewToggle}>
                        <button 
                            onClick={() => setViewMode('grid')}
                            style={{...styles.toggleBtn, ...(viewMode === 'grid' ? styles.toggleBtnActive : {})}}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                            style={{...styles.toggleBtn, ...(viewMode === 'table' ? styles.toggleBtnActive : {})}}
                            title="Table View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <div style={styles.tabsContainer}>
                        <TabButton id="ALL" label="All" count={totalCount} color="#64748b" icon={LayoutGrid} />
                        <TabButton id="ACCEPTED" label="Accepted" count={filteredData.accepted.length} color="#10b981" icon={CheckCircle} />
                        <TabButton id="ASSIGNED" label="Pending" count={filteredData.assigned.length} color="#3b82f6" icon={Clock} />
                        <TabButton id="REJECTED" label="Rejected" count={filteredData.rejected.length} color="#ef4444" icon={XCircle} />
                        <TabButton id="NOT_ASSIGNED" label="Unassigned" count={filteredData.notAssigned.length} color="#f97316" icon={HelpCircle} />
                    </div>
                </div>
            </div>

            <div style={styles.contentArea}>
                {totalCount === 0 ? (
                    <div style={styles.emptyState}>
                        <Filter size={48} color="var(--text-muted)" />
                        <h3 style={{ marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>No assignments found</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Try adjusting your search terms or filter.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setActiveTab('ALL');}}
                            style={styles.clearButton}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <>
                            {(activeTab === 'ALL' || activeTab === 'ACCEPTED') && filteredData.accepted.length > 0 && (
                                <SectionGrid title="Accepted Assignments" icon={CheckCircle} color="#16a34a" items={filteredData.accepted} type="accepted" />
                            )}
                            {(activeTab === 'ALL' || activeTab === 'ASSIGNED') && filteredData.assigned.length > 0 && (
                                <SectionGrid title="Pending Acceptance" icon={Clock} color="#2563eb" items={filteredData.assigned} type="assigned" />
                            )}
                            {(activeTab === 'ALL' || activeTab === 'REJECTED') && filteredData.rejected.length > 0 && (
                                <SectionGrid title="Rejected Assignments" icon={XCircle} color="#dc2626" items={filteredData.rejected} type="rejected" />
                            )}
                            {(activeTab === 'ALL' || activeTab === 'NOT_ASSIGNED') && filteredData.notAssigned.length > 0 && (
                                <SectionGrid title="Not Assigned" icon={HelpCircle} color="#ea580c" items={filteredData.notAssigned} type="notAssigned" />
                            )}
                        </>
                    ) : (
                        <AssignmentsTable data={getCurrentList()} />
                    )
                )}
            </div>
        </div>
    );
};

const SectionGrid = ({ title, icon: Icon, color, items, type }) => (
    <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color }}>
            <Icon size={18}/> {title}
        </h3>
        <div style={styles.grid}>
            {items.map((asg, i) => (
                <AssignmentCard key={i} data={asg} type={type} />
            ))}
        </div>
    </div>
);

const ExpandableText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div 
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            style={{
                ...styles.expandableText,
                ...(expanded ? styles.expanded : styles.collapsed)
            }}
        >
            {text}
        </div>
    );
};

const AssignmentCard = ({ data, type }) => {
    const [isHovered, setIsHovered] = useState(false);
    const typeColors = { accepted: '#10b981', assigned: '#3b82f6', rejected: '#ef4444', notAssigned: '#f97316' };
    const borderStyle = { borderLeft: `4px solid ${typeColors[type]}` };
    const recText = data.javaHazopNodeRecommendation?.recommendation || data.recommendation || 'N/A';

    return (
        <div 
            style={{ ...styles.card, ...borderStyle, ...(isHovered ? styles.cardHover : {}) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.cardHeader}>
                <span style={styles.label}>Recommendation</span>
                <ExpandableText text={recText} />
            </div>
            <div style={styles.cardGrid}>
                {type === 'notAssigned' ? (
                    <div style={{ ...styles.gridItemFull, color: '#ea580c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> <span>Awaiting Assignment</span>
                    </div>
                ) : (
                    <>
                        <div style={styles.gridItem}>
                            <span style={styles.label}>Assignee</span>
                            <span style={styles.value}>
                                {data.assignToEmpCode || data.acceptedByEmployeeName || 'N/A'}
                            </span>
                        </div>
                        <div style={styles.gridItem}>
                            <span style={styles.label}>Date</span>
                            <span style={styles.value}>
                                {data.assignWorkDate || 'N/A'}
                            </span>
                        </div>
                        <div style={styles.gridItemFull}>
                            <span style={styles.label}>{type === 'rejected' ? 'Rejection Reason' : 'Comments'}</span>
                            <span style={{ color: type === 'rejected' ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {data.comment || (type === 'assigned' ? 'Awaiting Acceptance' : 'No comments')}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const AssignmentsTable = ({ data }) => {
    return (
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Type</th>
                        <th style={{...styles.th, width: '40%'}}>Recommendation</th>
                        <th style={styles.th}>Assignee</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status / Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => {
                        const recText = row.javaHazopNodeRecommendation?.recommendation || row.recommendation || 'N/A';
                        const typeConfig = {
                            accepted: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Accepted' },
                            assigned: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Pending' },
                            rejected: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Rejected' },
                            notAssigned: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', label: 'Unassigned' }
                        };
                        const config = typeConfig[row.statusType];
                        return (
                            <tr key={idx} style={styles.tr}>
                                <td style={styles.td}>
                                    <span style={{...styles.statusBadge, backgroundColor: config.bg, color: config.color}}>
                                        {config.label}
                                    </span>
                                </td>
                                <td style={styles.td}><ExpandableText text={recText} /></td>
                                <td style={styles.td}>{row.assignToEmpCode || row.acceptedByEmployeeName || '-'}</td>
                                <td style={styles.td}>{row.assignWorkDate || '-'}</td>
                                <td style={styles.td}>
                                    <span style={{color: row.statusType === 'rejected' ? '#ef4444' : 'var(--text-secondary)'}}>
                                        {row.comment || '-'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    
    // Header & Controls (Updated with Variables)
    controlsHeader: {
        backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '12px',
        boxShadow: '0 1px 3px var(--shadow-color)', border: '1px solid var(--border-color)',
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between',
    },
    searchContainer: { position: 'relative', flexGrow: 1, minWidth: '250px', maxWidth: '400px' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
    searchInput: {
        width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px',
        border: '1px solid var(--input-border)', fontSize: '0.875rem', outline: 'none', 
        transition: 'border-color 0.2s', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)'
    },
    
    // Toggle Buttons
    viewToggle: {
        display: 'flex', backgroundColor: 'var(--bg-row-even)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)'
    },
    toggleBtn: {
        padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
        borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'
    },
    toggleBtnActive: {
        backgroundColor: 'var(--bg-card)', color: '#3b82f6', boxShadow: '0 1px 2px var(--shadow-color)'
    },

    // Tabs
    tabsContainer: { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' },
    tabButton: {
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
        borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'transparent',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
    },
    tabActive: { backgroundColor: 'var(--bg-row-even)' },
    tabHover: { backgroundColor: 'var(--bg-hover)' },
    badge: {
        marginLeft: '4px', padding: '2px 8px', borderRadius: '999px',
        backgroundColor: 'var(--bg-row-even)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
        border: '1px solid var(--border-color)'
    },

    // Content Areas
    contentArea: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    section: { animation: 'fadeIn 0.4s ease-out' },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
    
    // Card Styles
    card: {
        backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '1rem',
        boxShadow: '0 1px 2px var(--shadow-color)', border: '1px solid var(--border-color)',
        transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative',
        display: 'flex', flexDirection: 'column', gap: '0.75rem'
    },
    cardHover: { boxShadow: '0 4px 6px -1px var(--shadow-color)', transform: 'translateY(-2px)' },
    cardHeader: { borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' },
    cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' },
    gridItem: { display: 'flex', flexDirection: 'column' },
    gridItemFull: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' },
    value: { color: 'var(--text-main)', fontWeight: 500 },

    // Table Styles
    tableWrapper: {
        backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden',
        boxShadow: '0 1px 3px var(--shadow-color)', animation: 'fadeIn 0.3s ease-out'
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    tableHeaderRow: { backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' },
    th: {
        textAlign: 'left', padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)',
        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    tr: { borderBottom: '1px solid var(--border-color)' },
    td: { padding: '1rem', color: 'var(--text-main)', verticalAlign: 'top' },
    statusBadge: {
        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
        textTransform: 'uppercase', display: 'inline-block'
    },

    expandableText: {
        fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5,
        transition: 'all 0.3s ease', cursor: 'default'
    },
    collapsed: {
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    },
    expanded: { display: 'block', height: 'auto' },

    emptyState: {
        textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px',
        border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    clearButton: {
        marginTop: '1rem', background: 'none', border: 'none', color: '#2563eb',
        fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
    }
};

export default Assignments;