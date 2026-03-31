import React, { useState, useEffect } from 'react';
import { LAB_DATA, SYNTAX_SECTIONS } from '../dbData';


const RightPanel = React.forwardRef(({ queryHistory, onSelectSql, ...props }, ref) => {
    const [activeTab, setActiveTab] = useState('lab');
    const [labCategory, setLabCategory] = useState('sql1');
    const [openLabQ, setOpenLabQ] = useState(null);
    // To track which questions have answers revealed
    const [revealedAnswers, setRevealedAnswers] = useState({});
    
    // Assessment Feature
    const [assessmentMode, setAssessmentMode] = useState(false);
    const [progress, setProgress] = useState(() => {
        try {
            const saved = localStorage.getItem('isql_progress');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    React.useEffect(() => {
        setRevealedAnswers({});
    }, [openLabQ]);

    React.useEffect(() => {
        localStorage.setItem('isql_progress', JSON.stringify(progress));
    }, [progress]);

    const handleToggleAssess = () => setAssessmentMode(p => !p);
    
    const handleRestartAssess = () => {
        if (confirm('Are you sure you want to clear your assessment progress for all categories?')) {
            setProgress({});
            setAssessmentMode(false);
        }
    };
    
    const handleTick = (e, catId, qIndex) => {
        e.stopPropagation(); // prevent opening/closing the question row
        const checked = e.target.checked;
        setProgress(prev => {
            const catProgress = prev[catId] || [];
            if (checked) {
                return { ...prev, [catId]: [...new Set([...catProgress, qIndex])] };
            } else {
                return { ...prev, [catId]: catProgress.filter(idx => idx !== qIndex) };
            }
        });
    };

    const handleCategoryChange = (e) => {
        setLabCategory(e.target.value);
        setRevealedAnswers({});
        setOpenLabQ(null);
    };

    const renderLab = () => {
        const catData = LAB_DATA[labCategory];
        const catProgress = progress[labCategory] || [];
        const completedCount = catProgress.length;
        const totalCount = catData ? catData.questions.length : 0;

        return (
            <div className="lab-panel vis">
                <div className="lab-selector" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <select value={labCategory} onChange={handleCategoryChange} style={{ flex: 1 }}>
                        <option value="sql1">SQL-1: Basics (DDL/DML)</option>
                        <option value="sql2">SQL-2: SELECT, Operators, Aliases</option>
                        <option value="sql3">SQL-3: Functions &amp; GROUP BY</option>
                        <option value="setops">Set Operations (UNION, INTERSECT)</option>
                        <option value="subquery">Subqueries &amp; ORDER BY</option>
                        <option value="constraints">Constraints</option>
                        <option value="joins">Joins</option>
                    </select>
                    <button className="clear-btn" onClick={handleToggleAssess} style={{ padding: '4px 6px', background: assessmentMode ? 'var(--oracle-blue)' : 'white', color: assessmentMode ? 'white' : 'var(--text)' }}>
                        {assessmentMode ? '✓ Assessment ON' : 'Assessment'}
                    </button>
                    {assessmentMode && (
                        <button className="clear-btn" onClick={handleRestartAssess} style={{ padding: '4px 6px', color: 'var(--oracle-red)' }} title="Reset Progress">
                            ↺ Restart
                        </button>
                    )}
                </div>

                {assessmentMode && catData && (
                    <div style={{ padding: '0 10px 10px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(completedCount / totalCount) * 100}%`, background: 'var(--success)', height: '100%', transition: 'width 0.3s' }}></div>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>{completedCount} / {totalCount}</span>
                    </div>
                )}

                <div className="lab-q-list">
                    {catData ? catData.questions.map((item, i) => {
                        const isOpen = openLabQ === i;
                        const isRevealed = !!revealedAnswers[i];
                        const isDone = catProgress.includes(i);
                        return (
                            <div key={i} className={`lab-q ${isOpen ? 'open' : ''}`} style={{ opacity: isDone ? 0.6 : 1 }}>
                                <div className="lab-q-head" onClick={() => {
                                    if (isOpen) {
                                        setOpenLabQ(null);
                                        setRevealedAnswers(prev => {
                                            const next = { ...prev };
                                            delete next[i];
                                            return next;
                                        });
                                    } else {
                                        setOpenLabQ(i);
                                    }
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {assessmentMode && (
                                            <input 
                                                type="checkbox" 
                                                checked={isDone} 
                                                onChange={(e) => handleTick(e, labCategory, i)} 
                                                onClick={(e) => e.stopPropagation()} 
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                        <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                                            Q{i + 1}. {item.q.substring(0, 45)}{item.q.length > 45 ? '…' : ''}
                                        </span>
                                    </div>
                                    <span>▶</span>
                                </div>
                                <div className="lab-q-body">
                                    <div className="lab-q-text">{item.q}</div>
                                    {revealedAnswers[i] ? (
                                        <>
                                            <div className="lab-ans" title="Click to load into editor" onClick={() => onSelectSql(item.a)}>
                                                {item.a}
                                            </div>
                                            <div className="lab-ans-hint">↑ Click answer to load into editor, then Execute</div>
                                        </>
                                    ) : (
                                        <button 
                                            className="show-ans-btn"
                                            onClick={() => setRevealedAnswers(prev => ({ ...prev, [i]: true }))}
                                        >
                                            👁 Show Answer
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }) : null}
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

    return (
        <div className={`right-panel ${props.className || ''}`} style={props.style} ref={ref}>
            <div className="rp-tabs">
                <div className={`rp-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>Lab Q&amp;A</div>
                <div className={`rp-tab ${activeTab === 'syntax' ? 'active' : ''}`} onClick={() => setActiveTab('syntax')}>Syntax</div>
                <div className={`rp-tab ${activeTab === 'hist' ? 'active' : ''}`} onClick={() => setActiveTab('hist')}>History</div>
            </div>
            <div className="rp-body">
                {activeTab === 'lab' && renderLab()}
                {activeTab === 'syntax' && renderSyntax()}
                {activeTab === 'hist' && renderHistory()}
            </div>
        </div>
    );
});

export default RightPanel;
