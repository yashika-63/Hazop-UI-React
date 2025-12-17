
import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, CheckCircle, AlertCircle, XCircle, HelpCircle, 
    LayoutGrid, Clock, List, ChevronDown 
} from 'lucide-react';

const Assignments = ({ metrics, assignments }) => {
    // State for filtering & View Mode
    const [activeTab, setActiveTab] = useState('ALL'); 
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredTab, setHoveredTab] = useState(null);

    // --- LOGIC: Filter Lists ---
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

    // --- Helper: Get flattened list for specific views if needed ---
    const getCurrentList = () => {
        if (activeTab === 'ALL') {
            // Combine all for table view if "All" is selected
            return [
                ...filteredData.accepted.map(i => ({...i, statusType: 'accepted'})),
                ...filteredData.assigned.map(i => ({...i, statusType: 'assigned'})),
                ...filteredData.rejected.map(i => ({...i, statusType: 'rejected'})),
                ...filteredData.notAssigned.map(i => ({...i, statusType: 'notAssigned'}))
            ];
        }
        // Return specific list mapped with statusType
        const list = filteredData[activeTab === 'ACCEPTED' ? 'accepted' : 
                                  activeTab === 'ASSIGNED' ? 'assigned' :
                                  activeTab === 'REJECTED' ? 'rejected' : 'notAssigned'];
        
        const typeMap = {
            ACCEPTED: 'accepted', ASSIGNED: 'assigned', REJECTED: 'rejected', NOT_ASSIGNED: 'notAssigned'
        };
        return list.map(i => ({...i, statusType: typeMap[activeTab]}));
    };

    // --- COMPONENT: Tab Button ---
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
                    color: isActive ? '#1e293b' : '#64748b'
                }}
            >
                <Icon size={16} color={isActive ? color : '#94a3b8'} />
                {label}
                <span style={styles.badge}>{count}</span>
            </button>
        );
    };

    return (
        <div style={styles.container}>
            
            {/* --- HEADER CONTROLS --- */}
            <div style={styles.controlsHeader}>
                
                {/* Search Bar */}
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

                {/* Right Side: View Toggle & Tabs */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* View Toggle Buttons */}
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

                    {/* Filter Tabs */}
                    <div style={styles.tabsContainer}>
                        <TabButton id="ALL" label="All" count={totalCount} color="#64748b" icon={LayoutGrid} />
                        <TabButton id="ACCEPTED" label="Accepted" count={filteredData.accepted.length} color="#10b981" icon={CheckCircle} />
                        <TabButton id="ASSIGNED" label="Pending" count={filteredData.assigned.length} color="#3b82f6" icon={Clock} />
                        <TabButton id="REJECTED" label="Rejected" count={filteredData.rejected.length} color="#ef4444" icon={XCircle} />
                        <TabButton id="NOT_ASSIGNED" label="Unassigned" count={filteredData.notAssigned.length} color="#f97316" icon={HelpCircle} />
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div style={styles.contentArea}>
                {totalCount === 0 ? (
                    /* Empty State */
                    <div style={styles.emptyState}>
                        <Filter size={48} color="#e2e8f0" />
                        <h3 style={{ marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>No assignments found</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>Try adjusting your search terms or filter.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setActiveTab('ALL');}}
                            style={styles.clearButton}
                            onMouseEnter={(e) => e.target.style.color = '#1e40af'}
                            onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    /* Data Display */
                    viewMode === 'grid' ? (
                        /* GRID VIEW */
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
                        /* TABLE VIEW */
                        <AssignmentsTable data={getCurrentList()} />
                    )
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Section Wrapper for Grid ---
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

// --- Sub-Component: Expandable Text ---
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

// --- Sub-Component: Assignment Card (Grid) ---
const AssignmentCard = ({ data, type }) => {
    const [isHovered, setIsHovered] = useState(false);

    const typeColors = {
        accepted: '#10b981',
        assigned: '#3b82f6',
        rejected: '#ef4444',
        notAssigned: '#f97316'
    };

    const borderStyle = { borderLeft: `4px solid ${typeColors[type]}` };
    const recText = data.javaHazopNodeRecommendation?.recommendation || data.recommendation || 'N/A';

    return (
        <div 
            style={{ 
                ...styles.card, 
                ...borderStyle,
                ...(isHovered ? styles.cardHover : {})
            }}
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
                        {type === 'rejected' ? (
                             <div style={styles.gridItemFull}>
                                <span style={styles.label}>Rejection Reason</span>
                                <span style={styles.rejectedBadge}>
                                    {data.comment || 'No reason provided'}
                                </span>
                            </div>
                        ) : (
                            <div style={styles.gridItemFull}>
                                <span style={styles.label}>Comments / Status</span>
                                <span style={{ color: '#475569', fontSize: '0.875rem' }}>
                                    {data.comment || (type === 'assigned' ? 'Awaiting Acceptance' : 'No comments')}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Table View ---
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
                            accepted: { color: '#10b981', bg: '#dcfce7', label: 'Accepted' },
                            assigned: { color: '#3b82f6', bg: '#dbeafe', label: 'Pending' },
                            rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
                            notAssigned: { color: '#f97316', bg: '#ffedd5', label: 'Unassigned' }
                        };
                        const config = typeConfig[row.statusType];

                        return (
                            <tr key={idx} style={styles.tr}>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge, 
                                        backgroundColor: config.bg, 
                                        color: config.color
                                    }}>
                                        {config.label}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <ExpandableText text={recText} />
                                </td>
                                <td style={styles.td}>
                                    {row.assignToEmpCode || row.acceptedByEmployeeName || '-'}
                                </td>
                                <td style={styles.td}>
                                    {row.assignWorkDate || '-'}
                                </td>
                                <td style={styles.td}>
                                    {row.statusType === 'rejected' ? (
                                        <span style={{color: '#ef4444'}}>{row.comment}</span>
                                    ) : (
                                        <span style={{color: '#64748b'}}>
                                            {row.comment || (row.statusType === 'notAssigned' ? 'Action Required' : 'None')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- INTERNAL STYLES OBJECT ---
const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    
    // Header & Controls
    controlsHeader: {
        backgroundColor: 'white', padding: '1rem', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between',
    },
    searchContainer: { position: 'relative', flexGrow: 1, minWidth: '250px', maxWidth: '400px' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    searchInput: {
        width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px',
        border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s',
    },
    
    // Toggle Buttons
    viewToggle: {
        display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0'
    },
    toggleBtn: {
        padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
        borderRadius: '6px', color: '#64748b', display: 'flex', alignItems: 'center'
    },
    toggleBtnActive: {
        backgroundColor: 'white', color: '#3b82f6', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },

    // Tabs
    tabsContainer: { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' },
    tabButton: {
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
        borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'transparent',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
    },
    tabActive: { backgroundColor: '#f8fafc' },
    tabHover: { backgroundColor: '#f1f5f9' },
    badge: {
        marginLeft: '4px', padding: '2px 8px', borderRadius: '999px',
        backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 600,
    },

    // Content Areas
    contentArea: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    section: { animation: 'fadeIn 0.4s ease-out' },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
    
    // Card Styles
    card: {
        backgroundColor: 'white', borderRadius: '8px', padding: '1rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
        transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative',
        display: 'flex', flexDirection: 'column', gap: '0.75rem'
    },
    cardHover: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' },
    cardHeader: { borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' },
    cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' },
    gridItem: { display: 'flex', flexDirection: 'column' },
    gridItemFull: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' },
    value: { color: '#334155', fontWeight: 500 },
    rejectedBadge: {
        backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px',
        fontSize: '0.8rem', display: 'inline-block', marginTop: '4px',
    },

    // Table Styles
    tableWrapper: {
        backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', animation: 'fadeIn 0.3s ease-out'
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: {
        textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569',
        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '1rem', color: '#1e293b', verticalAlign: 'top' },
    statusBadge: {
        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
        textTransform: 'uppercase', display: 'inline-block'
    },

    // Expandable Text
    expandableText: {
        fontSize: '0.9rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.5,
        transition: 'all 0.3s ease', cursor: 'default'
    },
    collapsed: {
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    },
    expanded: {
        display: 'block', height: 'auto' // Expands naturally
    },

    // Empty State
    emptyState: {
        textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px',
        border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    clearButton: {
        marginTop: '1rem', background: 'none', border: 'none', color: '#2563eb',
        fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
    }
};

export default Assignments; 