import React from 'react';

export default function Header({ onExportSQL, onResetDB, theme, toggleTheme }) {
    return (
        <header>
            <div className="h-left">
                <div className="logo-oracle">QPracto</div>
                <div className="logo-divider"></div>
                <div className="app-title"><em>i</em>SQL*Home &nbsp;— College Practice Edition</div>
            </div>
            <div className="h-right">
                <button className="h-btn" onClick={toggleTheme} style={{ marginRight: '8px', minWidth: '85px' }}>
                    {theme === 'light' ? '☀️ Light' : (theme === 'dark' ? '🌙 Dark' : '🌗 Dimmed')}
                </button>
                <div className="db-badge">● Connected (SQLite)</div>
                <button className="h-btn" onClick={onExportSQL}>⬇ Export SQL</button>
                <button className="h-btn red" onClick={onResetDB}>⚠ Reset DB</button>
            </div>
        </header>
    );
}
