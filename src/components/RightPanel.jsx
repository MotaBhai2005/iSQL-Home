import React, { useState } from 'react';
import { LAB_DATA, SYNTAX_SECTIONS } from '../dbData';

export default function RightPanel({ queryHistory, schema, onSelectSql }) {
    const [activeTab, setActiveTab] = useState('lab');
    const [labCategory, setLabCategory] = useState('sql1');
    const [openLabQ, setOpenLabQ] = useState(null);

    const renderLab = () => {
        const data = LAB_DATA[labCategory];
        if (!data) return null;
        return (
            <div className="lab-panel vis">
                <div className="lab-selector">
                    <select value={labCategory} onChange={e => setLabCategory(e.target.value)}>
                        <option value="sql1">SQL-1: Basics (DDL/DML)</option>
                        <option value="sql2">SQL-2: SELECT, Operators, Aliases</option>
                        <option value="sql3">SQL-3: Functions &amp; GROUP BY</option>
                        <option value="subquery">Subqueries &amp; ORDER BY</option>
                        <option value="constraints">Constraints</option>
                        <option value="joins">Joins</option>
                    </select>
                </div>
                <div className="lab-list">
                    {data.note && (
                        <div className="oracle-note">
                            <b>📌 Topic:</b> {data.note}
                        </div>
                    )}
                    {data.questions.map((item, i) => {
                        const isOpen = openLabQ === i;
                        return (
                            <div key={i} className={`lab-q ${isOpen ? 'open' : ''}`}>
                                <div className="lab-q-head" onClick={() => setOpenLabQ(isOpen ? null : i)}>
                                    <span>Q{i + 1}. {item.q.substring(0, 45)}{item.q.length > 45 ? '…' : ''}</span>
                                    <span>▶</span>
                                </div>
                                <div className="lab-q-body">
                                    <div className="lab-q-text">{item.q}</div>
                                    <div className="lab-ans" title="Click to load into editor" onClick={() => onSelectSql(item.a)}>
                                        {item.a}
                                    </div>
                                    <div className="lab-ans-hint">↑ Click answer to load into editor, then Execute</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSyntax = () => {
        return (
            <div className="syntax-panel vis">
                {SYNTAX_SECTIONS.map((sec, i) => (
                    <div key={i} className="syn-section">
                        <div className="syn-title">{sec.title}</div>
                        {sec.items.map((item, j) => (
                            <div key={j} className="syn-block" title="Click to load into editor" onClick={() => onSelectSql(item.s)}>
                                {item.s}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    const renderHistory = () => {
        return (
            <div className="hist-panel vis">
                <div className="hist-hint">Click any query to reload it into the editor</div>
                <div className="hist-list">
                    {queryHistory.map((q, i) => (
                        <div key={i} className="hist-item" title="Click to load into editor" onClick={() => onSelectSql(q + ';')}>
                            {q};
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSchema = () => {
        return (
            <div className="schema-panel vis">
                {schema.length === 0 ? (
                    <div style={{ color: '#aaa', padding: '10px', fontSize: '11px' }}>No tables yet.</div>
                ) : (
                    schema.map((tbl, i) => (
                        <React.Fragment key={i}>
                            <div className="sch-tbl-name">▦ {tbl.name}</div>
                            {tbl.columns.map((col, j) => {
                                const isPK = col[5] === 1;
                                const nn = col[3] === 1;
                                return (
                                    <div key={j} className="sch-col">
                                        {isPK && <span className="sch-pk">PK</span>}
                                        <b>{col[1]}</b>
                                        <span className="sch-ct">{col[2] || ''}</span>
                                        {nn && !isPK && <span className="sch-nn">NN</span>}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="right-panel">
            <div className="rp-tabs">
                <div className={`rp-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>Lab Q&amp;A</div>
                <div className={`rp-tab ${activeTab === 'syntax' ? 'active' : ''}`} onClick={() => setActiveTab('syntax')}>Syntax</div>
                <div className={`rp-tab ${activeTab === 'hist' ? 'active' : ''}`} onClick={() => setActiveTab('hist')}>History</div>
                <div className={`rp-tab ${activeTab === 'schema' ? 'active' : ''}`} onClick={() => setActiveTab('schema')}>Schema</div>
            </div>
            <div className="rp-body">
                {activeTab === 'lab' && renderLab()}
                {activeTab === 'syntax' && renderSyntax()}
                {activeTab === 'hist' && renderHistory()}
                {activeTab === 'schema' && renderSchema()}
            </div>
        </div>
    );
}
