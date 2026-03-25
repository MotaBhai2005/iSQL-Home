import React, { useRef } from 'react';
import { SNIPPETS } from '../db';
import EditorPkg from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';

const Editor = EditorPkg.default || EditorPkg;

const ResultTable = ({ out, onExportCSV }) => {
    const [page, setPage] = React.useState(0);
    const PAGE_SIZE = 50;

    const totalPages = Math.ceil(out.values.length / PAGE_SIZE);
    const startIdx = page * PAGE_SIZE;
    const currentRows = out.values.slice(startIdx, startIdx + PAGE_SIZE);

    return (
        <div className="res-tbl-wrap">
            <table className="res-tbl">
                <thead>
                    <tr>
                        {out.columns.map((c, i) => <th key={i}>{c.toUpperCase()}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} className={cell === null ? 'null-val' : ''}>
                                    {cell === null ? '(null)' : String(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '0 4px 6px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {out.rowCount !== undefined && (
                        <div className="res-rowcount" style={{ marginTop: 0 }}>
                            {out.rowCount} row(s)
                            {totalPages > 1 ? ` (showing ${startIdx + 1} - ${Math.min(startIdx + PAGE_SIZE, out.values.length)})` : ''}
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                                className="clear-btn" 
                                style={{ padding: '2px 6px', fontSize: '11px', opacity: page === 0 ? 0.5 : 1 }} 
                                disabled={page === 0} 
                                onClick={() => setPage(p => p - 1)}
                            >
                                ◀ Prev
                            </button>
                            <span style={{ fontSize: '11px', alignSelf: 'center', color: 'var(--text-muted)' }}>
                                Page {page + 1} of {totalPages}
                            </span>
                            <button 
                                className="clear-btn" 
                                style={{ padding: '2px 6px', fontSize: '11px', opacity: page === totalPages - 1 ? 0.5 : 1 }} 
                                disabled={page === totalPages - 1} 
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next ▶
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => onExportCSV(out.columns, out.values)}
                    style={{ 
                        background: 'var(--success)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '4px 10px', 
                        fontSize: '11px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontFamily: 'var(--mono)',
                        fontWeight: 'bold',
                        transition: 'opacity 0.2s',
                        opacity: 0.9
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0.9}
                >
                    📥 Download CSV
                </button>
            </div>
        </div>
    );
};

const Workspace = React.forwardRef(({
    tabs, activeTabId, onAddTab, onCloseTab, onSwitchTab,
    onRunSQL, onClearEditor, sqlOutput, updateTabSql, ...props
}, ref) => {
    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    
    const getEditorTextarea = () => document.querySelector('.sql-editor textarea');

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRunSQL(activeTab.sql);
        }
    };

    const handleSnippet = (snippet) => {
        const ed = getEditorTextarea();
        if (!ed) return;
        const pos = ed.selectionStart;
        const val = ed.value;
        const newSql = val.slice(0, pos) + snippet + val.slice(ed.selectionEnd);
        updateTabSql(activeTab.id, newSql);
        setTimeout(() => { ed.focus(); ed.selectionStart = ed.selectionEnd = pos + snippet.length; }, 0);
    };
//handle export csv
    const handleExportCSV = (columns, values) => {
        if (!columns || !values) return;
        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '';
            const s = String(str);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };
        const header = columns.map(escapeCSV).join(',');
        const rows = values.map(row => row.map(escapeCSV).join(',')).join('\n');
        const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_results_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`workspace ${props.className || ''}`} style={props.style} ref={ref}>
            {/* Tabs */}
            <div className="tab-bar">
                {tabs.map(t => (
                    <div key={t.id} className={`ws-tab ${t.id === activeTabId ? 'active' : ''}`} onClick={() => onSwitchTab(t.id)}>
                        {t.label}
                        {tabs.length > 1 && (
                            <span className="tab-x" onClick={(e) => { e.stopPropagation(); onCloseTab(t.id); }}>✕</span>
                        )}
                    </div>
                ))}
                <div className="tab-plus" onClick={onAddTab} title="New Worksheet">+</div>
            </div>

            {/* Editor Panel */}
            <div className="editor-panel">
                <div className="ep-label">Enter statements:</div>
                <Editor
                    value={activeTab?.sql || ''}
                    onValueChange={(code) => updateTabSql(activeTab.id, code)}
                    highlight={(code) => Prism.languages.sql ? Prism.highlight(code || '', Prism.languages.sql, 'sql') : code || ''}
                    padding={12}
                    className="sql-editor"
                    textareaClassName="sql-editor-textarea"
                    placeholder="-- Type SQL here. Press Ctrl+Enter to execute.&#10;-- Oracle syntax supported (translated to SQLite automatically)&#10;-- Example: CREATE TABLE student (s_id NUMBER(4) PRIMARY KEY, name VARCHAR(20));"
                    onKeyDown={handleKeyDown}
                    insertSpaces={true}
                    tabSize={4}
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 13,
                        lineHeight: 1.55,
                        backgroundColor: 'var(--bg-panel)'
                    }}
                />
                <div className="ep-footer">
                    <div className="ep-left">
                        <button className="exec-btn" onClick={() => onRunSQL(activeTab.sql)}>Execute</button>
                        <span className="char-c" style={{ marginLeft: '6px' }}>{(activeTab?.sql || '').length} chars</span>
                    </div>
                    <div className="ep-right">
                        <span className="shortcut-hint"><span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> to run</span>
                        <button className="clear-btn" onClick={() => onClearEditor(activeTab.id)}>Clear</button>
                    </div>
                </div>
            </div>

            {/* Snippets */}
            <div className="snip-bar">
                <span className="snip-label">Quick Insert →</span>
                {SNIPPETS.map((snip, idx) => (
                    <span key={idx} className="snip" onClick={() => handleSnippet(snip.trim() + ' ')}>
                        {snip.trim()}
                    </span>
                ))}
            </div>

            {/* Output */}
            <div className="output-area">
                {sqlOutput.length === 0 ? (
                    <div className="output-placeholder">
                        <div className="big">🗄</div>
                        <div>Execute a SQL statement to see results here.</div>
                        <div style={{ fontSize: '11px' }}>Select a Lab Question from the right panel to practice.</div>
                    </div>
                ) : (
                    sqlOutput.map((out, idx) => (
                        <div key={idx} className="result-block">
                            {out.sqlLine && <div className="res-sql-line">{out.sqlLine};</div>}
                            {out.msg && <div className={`res-msg ${out.msgClass}`}>{out.msg}</div>}
                            {out.columns && out.values && (
                                <ResultTable out={out} onExportCSV={handleExportCSV} />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Status bar (moved to App.jsx for global state, or kept here as a prop) */}
        </div>
    );
});

export default Workspace;
