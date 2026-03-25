/* eslint-disable no-empty */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import RightPanel from './components/RightPanel';
import Split from 'react-split';

function App() {
  const workerRef = useRef(null);
  const pendingRef = useRef({});
  const msgIdRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [schema, setSchema] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('isql_theme') || 'light');
  const [mobilePanel, setMobilePanel] = useState('workspace');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [queryHistory, setQueryHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('isql_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('isql_history', JSON.stringify(queryHistory));
  }, [queryHistory]);
  const [tabs, setTabs] = useState([{ id: 1, label: 'Worksheet 1', sql: '' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [tabCtr, setTabCtr] = useState(2);
  const [sqlOutput, setSqlOutput] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Ready — Connected to in-memory SQLite database');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('isql_theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Create and initialize Web Worker
  useEffect(() => {
    const worker = new Worker(new URL('./dbWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { id, success, error } = e.data;
      const resolve = pendingRef.current[id];
      if (resolve) {
        delete pendingRef.current[id];
        if (success) {
          resolve({ success: true, data: e.data });
        } else {
          resolve({ success: false, error });
        }
      }
    };

    worker.onerror = (err) => {
      console.error('Worker failed to initialize:', err);
      setErrorMsg(`Web Worker crashed: ${err.message || err.filename + ':' + err.lineno} ` + (err.error ? err.error.stack : ''));
      setLoading(false);
    };

    // Initialize the DB in the worker
    callWorker('INIT')
      .then(({ success, data, error }) => {
        if (success) {
          if (data.schema) setSchema(data.schema);
          setLoading(false);
          setStatusMsg('Ready — Connected to in-memory SQLite database');
        } else {
          setErrorMsg(error || 'Failed to initialize database worker');
          setLoading(false);
        }
      });

    return () => worker.terminate();
  }, []);

  const callWorker = (action, payload = {}) => {
    return new Promise((resolve) => {
      const id = ++msgIdRef.current;
      pendingRef.current[id] = resolve;
      workerRef.current.postMessage({ id, action, payload });
    });
  };

  const runSQLLocal = useCallback(async (rawSql) => {
    if (!rawSql.trim()) return;
    setSqlOutput([]);

    const { success, data, error } = await callWorker('RUN_SQL_LOCAL', { rawSql });

    if (success) {
      const { newOutputs, schema: newSchema, mutated } = data;
      setSqlOutput(newOutputs);
      if (mutated && newSchema) setSchema(newSchema);

      // Pull origSQL from last successful output for history
      const successfulSqls = newOutputs
        .filter(b => b.msgClass !== 'err' && b.sqlLine)
        .map(b => b.sqlLine);
      if (successfulSqls.length > 0) {
        setQueryHistory(prev => {
          const combined = [...successfulSqls, ...prev];
          return combined.slice(0, 60);
        });
      }
      setStatusMsg(`Executed successfully — ${new Date().toLocaleTimeString()}`);
    } else {
      setSqlOutput([{ msg: 'ERROR at line 1:\nORA-00000: ' + error, msgClass: 'err', sqlLine: rawSql }]);
      setStatusMsg('Error: ' + error);
    }
  }, []);

  const handleExportSQL = useCallback(async () => {
    const { success, data } = await callWorker('EXPORT_SQL');
    if (!success || !data.out) {
      alert('No tables to export.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data.out], { type: 'text/sql' }));
    a.download = 'isqlhome_export_' + Date.now() + '.sql';
    a.click();
  }, []);

  const handleResetDB = useCallback(async () => {
    if (!window.confirm('This will permanently drop ALL tables and data. This cannot be undone. Are you sure?')) return;
    const { success, data } = await callWorker('RESET_DB');
    if (success) {
      setSchema(data.schema || []);
      setQueryHistory([]);
      localStorage.removeItem('isql_history');
      setSqlOutput([{ msg: 'Database and History reset cleanly.', msgClass: 'info' }]);
      setStatusMsg('Database reset — ' + new Date().toLocaleTimeString());
    }
  }, []);

  const handleLoadLab = useCallback(async () => {
    if (!window.confirm('Creates person1234 and orders1234 tables with data. Are you sure?')) return;
    const { success, data } = await callWorker('LOAD_LAB');
    if (success) {
      setSchema(data.schema || []);
      setSqlOutput([
        { msg: 'Constraints Lab DB loaded: person1234 (4 rows), orders1234 (4 rows).', msgClass: 'ok' },
        { msg: 'Try: SELECT * FROM person1234;', msgClass: 'info' }
      ]);
      handleUpdateTabSql(activeTabId, 'SELECT * FROM person1234;');
      setStatusMsg('Constraints Lab DB loaded — ' + new Date().toLocaleTimeString());
    }
  }, [activeTabId]);

  const handleLoadJoins = useCallback(async () => {
    if (!window.confirm('Creates employees, departments, managers tables with exact data. Are you sure?')) return;
    const { success, data } = await callWorker('LOAD_JOINS');
    if (success) {
      setSchema(data.schema || []);
      setSqlOutput([
        { msg: 'Joins Lab DB loaded: employees (5), departments (3), managers (2).', msgClass: 'ok' },
        { msg: 'Try: SELECT e.first_name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.department_id;', msgClass: 'info' }
      ]);
      handleUpdateTabSql(activeTabId, 'SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;');
      setStatusMsg('Joins Lab DB loaded — ' + new Date().toLocaleTimeString());
    }
  }, [activeTabId]);

  const handleUpdateTabSql = (id, newSql) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, sql: newSql } : t));
  };

  const handleAddTab = () => {
    setTabs(prev => [...prev, { id: tabCtr, label: 'Worksheet ' + tabCtr, sql: '' }]);
    setActiveTabId(tabCtr);
    setTabCtr(tabCtr + 1);
    setSqlOutput([{ msg: 'New worksheet ready.', msgClass: 'info' }]);
  };

  const handleCloseTab = (id) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
  };

  const handleSelectSql = (sqlStr) => handleUpdateTabSql(activeTabId, sqlStr);
  const handleTableClick = (tableName) => handleUpdateTabSql(activeTabId, `SELECT * FROM ${tableName};`);

  //loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="ld-logo">QPracto</div>
        <div className="ld-sub"><em>i</em>SQL*Home &nbsp;— College Practice Edition</div>
        <div className="spinner"></div>
        <div className="ld-txt">Initializing SQLite engine…</div>
      </div>
    );
  }

  //error screen
  if (errorMsg) {
    return (
      <div style={{ color: 'red', padding: '24px', textAlign: 'center' }}>
        <b>Failed to load SQL engine</b><br />{errorMsg}<br />
        <small>Requires internet for CDN dependencies. Try refreshing.</small>
      </div>
    );
  }

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        onExportSQL={handleExportSQL}
        onResetDB={handleResetDB}
        theme={theme}
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : (t === 'dark' ? 'dimmed' : 'light'))}
      />

      {isMobile ? (
        <>
          <div className="mobile-body">
            {mobilePanel === 'schema' && (
              <Sidebar
                schema={schema}
                onLoadLab={handleLoadLab}
                onLoadJoins={handleLoadJoins}
                onReset={handleResetDB}
                onTableClick={handleTableClick}
              />
            )}
            {mobilePanel === 'workspace' && (
              <Workspace
                tabs={tabs}
                activeTabId={activeTabId}
                onAddTab={handleAddTab}
                onCloseTab={handleCloseTab}
                onSwitchTab={setActiveTabId}
                onRunSQL={runSQLLocal}
                onClearEditor={(id) => handleUpdateTabSql(id, '')}
                sqlOutput={sqlOutput}
                updateTabSql={handleUpdateTabSql}
              />
            )}
            {mobilePanel === 'lab' && (
              <RightPanel
                queryHistory={queryHistory}
                schema={schema}
                onSelectSql={(sql) => { handleSelectSql(sql); setMobilePanel('workspace'); }}
              />
            )}
          </div>
          <nav className="mobile-nav">
            <button className={`mobile-nav-btn${mobilePanel === 'schema' ? ' active' : ''}`} onClick={() => setMobilePanel('schema')}>🗄️ Schema</button>
            <button className={`mobile-nav-btn${mobilePanel === 'workspace' ? ' active' : ''}`} onClick={() => setMobilePanel('workspace')}>⚡ SQL</button>
            <button className={`mobile-nav-btn${mobilePanel === 'lab' ? ' active' : ''}`} onClick={() => setMobilePanel('lab')}>📋 Lab</button>
          </nav>
        </>
      ) : (
        <>
          <Split
            className="app-body split"
            sizes={[20, 50, 30]}
            minSize={[150, 300, 200]}
            gutterSize={6}
            snapOffset={30}
            direction="horizontal"
          >
            <Sidebar
              schema={schema}
              onLoadLab={handleLoadLab}
              onLoadJoins={handleLoadJoins}
              onReset={handleResetDB}
              onTableClick={handleTableClick}
            />

            <Workspace
              tabs={tabs}
              activeTabId={activeTabId}
              onAddTab={handleAddTab}
              onCloseTab={handleCloseTab}
              onSwitchTab={setActiveTabId}
              onRunSQL={runSQLLocal}
              onClearEditor={(id) => handleUpdateTabSql(id, '')}
              sqlOutput={sqlOutput}
              updateTabSql={handleUpdateTabSql}
            />

            <RightPanel
              queryHistory={queryHistory}
              schema={schema}
              onSelectSql={handleSelectSql}
            />
          </Split>

          <div className="status-bar">
            <span>{statusMsg}</span>
            <span>SQLite In-Browser | Oracle Syntax Compatible</span>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
