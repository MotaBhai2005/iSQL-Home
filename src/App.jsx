/* eslint-disable no-empty */
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import RightPanel from './components/RightPanel';
import Split from 'react-split';
import { translateOracle, splitStatements, rewriteFullOuterJoin, rewriteRightJoin, getSuccessMsg, loadLabDB, loadJoinsDB } from './db';

function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [schema, setSchema] = useState([]);
  const [theme, setTheme] = useState('light');
  const [mobilePanel, setMobilePanel] = useState('workspace');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [queryHistory, setQueryHistory] = useState([]);
  const [tabs, setTabs] = useState([{ id: 1, label: 'Worksheet 1', sql: '' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [tabCtr, setTabCtr] = useState(2);
  const [sqlOutput, setSqlOutput] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Ready — Connected to in-memory SQLite database');

  // Init DB
  useEffect(() => {
    async function initDB() {
      try {
        if (!window.initSqlJs) {
          throw new Error('sql.js library not loaded from CDN');
        }
        const SQL = await window.initSqlJs({
          locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
        });
        const newDb = new SQL.Database();

        newDb.create_function('INITCAP', (str) => {
          if (!str) return str;
          return String(str).toLowerCase().replace(/(?:^|[^a-z0-9])[a-z]/gi, m => m.toUpperCase());
        });
        const lpadLogic = (str, n, pad) => {
          if (!str) return str;
          return String(str).padStart(n, pad || ' ');
        };
        newDb.create_function('LPAD', function (a, b) { return lpadLogic(a, b); });
        newDb.create_function('LPAD', function (a, b, c) { return lpadLogic(a, b, c); });

        const rpadLogic = (str, n, pad) => {
          if (!str) return str;
          return String(str).padEnd(n, pad || ' ');
        };
        newDb.create_function('RPAD', function (a, b) { return rpadLogic(a, b); });
        newDb.create_function('RPAD', function (a, b, c) { return rpadLogic(a, b, c); });
        newDb.create_function('MONTHS_BETWEEN', (d1, d2) => {
          if (!d1 || !d2) return null;
          const date1 = new Date(d1);
          const date2 = new Date(d2);
          return (date1.getFullYear() * 12 + date1.getMonth()) - (date2.getFullYear() * 12 + date2.getMonth());
        });
        newDb.create_function('LAST_DAY', (d) => {
          if (!d) return null;
          let parts = String(d).split('-');
          if (parts.length >= 2) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
            return `${year}-${parts[1].padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
          }
          return d;
        });
        newDb.create_function('NEXT_DAY', (d, dayStr) => {
          if (!d || !dayStr) return null;
          const date = new Date(d);
          const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
          const target = days.indexOf(dayStr.toUpperCase());
          if (target === -1) return d;
          let diff = target - date.getDay();
          if (diff <= 0) diff += 7;
          date.setDate(date.getDate() + diff);
          return date.toISOString().split('T')[0];
        });
        newDb.create_function('NEW_TIME', (d, z1, z2) => d); // Mock
        newDb.create_function('TO_CHAR', (val, fmt) => {
          if (!val) return null;
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
            const [y, m, d] = val.split(' ')[0].split('-');
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            if (fmt && fmt.includes('Month YYYY')) {
              const date = new Date(val);
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return `${days[date.getDay()]}, ${months[parseInt(m) - 1]} ${y}`;
            }
          }
          if (fmt && fmt.includes('$')) return '$' + val;
          return String(val);
        });
        newDb.create_function('TO_DATE', function (a) { return a; });
        newDb.create_function('TO_DATE', function (a, b) { return a; });
        newDb.create_function('TO_NUMBER', (val) => Number(val));
        newDb.create_function('ADD_MONTHS', (d, n) => {
          if (!d) return null;
          const date = new Date(d);
          date.setMonth(date.getMonth() + n);
          return date.toISOString().split('T')[0];
        });
        const truncLogic = (val, dec) => {
          if (typeof val === 'number') {
            const f = Math.pow(10, dec || 0);
            return Math.trunc(val * f) / f;
          }
          return String(val);
        };
        newDb.create_function('TRUNC', function (a) { return truncLogic(a, 0); });
        newDb.create_function('TRUNC', function (a, b) { return truncLogic(a, b); });

        setDb(newDb);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message);
      }
    }
    initDB();
  }, []);

  const refreshSchema = () => {
    if (!db) return;
    try {
      const res = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY type, name");
      if (!res.length || !res[0].values.length) {
        setSchema([]);
        return;
      }
      const newSchema = res[0].values.map(([name, type]) => {
        let rowCount = 0;
        try {
          const rc = db.exec(`SELECT COUNT(*) FROM "${name}"`);
          rowCount = rc[0].values[0][0];
        } catch (e) { }

        let columns = [];
        try {
          const cols = db.exec(`PRAGMA table_info("${name}")`);
          if (cols.length) columns = cols[0].values;
        } catch (e) { }

        return { name, type, rowCount, columns };
      });
      setSchema(newSchema);
    } catch (e) {
      console.error("Error refreshing schema", e);
    }
  };

  useEffect(() => {
    if (db) refreshSchema();
  }, [db]);

  const runSQLLocal = (rawSql) => {
    if (!db || !rawSql.trim()) return;
    setSqlOutput([]);

    const statements = splitStatements(rawSql);
    const newOutputs = [];

    statements.forEach(origSQL => {
      const block = { sqlLine: origSQL };

      try {
        let translatedSQL = translateOracle(origSQL);
        translatedSQL = rewriteFullOuterJoin(translatedSQL);
        translatedSQL = rewriteRightJoin(translatedSQL);
        const isQuery = /^(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(translatedSQL.trim());

        if (isQuery) {
          const result = db.exec(translatedSQL);
          if (!result.length || !result[0].values.length) {
            block.msg = 'no rows selected';
            block.msgClass = 'info';
          } else {
            const r = result[0];
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

            block.columns = r.columns.map(c => {
              if (c.toLowerCase() === "date('now')" || c.toLowerCase() === "date('now')") return "SYSDATE";
              return c === c.toLowerCase() && !c.includes(' ') ? c.toUpperCase() : c;
            });

            block.values = r.values.map(row => row.map(v => {
              if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
                const [y, m, d] = v.split('-');
                return `${d}-${months[parseInt(m, 10) - 1]}-${y}`;
              }
              return v;
            }));

            block.rowCount = r.values.length;
          }
        } else {
          db.run(translatedSQL);
          block.msg = getSuccessMsg(origSQL);
          block.msgClass = 'ok';
          refreshSchema();
        }

        // Add to history
        setQueryHistory(prev => {
          const newHist = [origSQL, ...prev];
          if (newHist.length > 60) newHist.pop();
          return newHist;
        });

        setStatusMsg(`Executed successfully — ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        block.msg = 'ERROR at line 1:\nORA-00000: ' + e.message;
        block.msgClass = 'err';
        setStatusMsg('Error: ' + e.message);
      }

      newOutputs.unshift(block);
    });

    setSqlOutput(newOutputs);
  };

  const handleExportSQL = () => {
    if (!db) return;
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    if (!tables.length || !tables[0].values.length) {
      alert('No tables to export.');
      return;
    }
    let out = '-- iSQL*Home Export (Oracle-compatible)\n-- ' + new Date().toISOString() + '\n\n';
    tables[0].values.forEach(([name]) => {
      try {
        const cr = db.exec(`SELECT sql FROM sqlite_master WHERE name='${name}'`);
        if (cr.length) out += cr[0].values[0][0] + ';\n\n';
        const rows = db.exec(`SELECT * FROM "${name}"`);
        if (rows.length && rows[0].values.length) {
          rows[0].values.forEach(row => {
            const vals = row.map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
            out += `INSERT INTO ${name} VALUES (${vals});\n`;
          });
          out += '\n';
        }
      } catch (e) { }
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([out], { type: 'text/sql' }));
    a.download = 'isqlhome_export_' + Date.now() + '.sql';
    a.click();
  };

  const handleResetDB = () => {
    if (!window.confirm("This will permanently drop ALL tables and data. This cannot be undone. Are you sure?")) {
      return;
    }
    if (!db) return;
    try {
      const t = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      if (t.length) t[0].values.forEach(([n]) => { try { db.run(`DROP TABLE IF EXISTS "${n}"`); } catch (e) { } });
      const v = db.exec("SELECT name FROM sqlite_master WHERE type='view'");
      if (v.length) v[0].values.forEach(([n]) => { try { db.run(`DROP VIEW IF EXISTS "${n}"`); } catch (e) { } });
    } catch (e) { }

    setSqlOutput([{ msg: 'Database reset. All tables dropped.', msgClass: 'info' }]);
    refreshSchema();
    setStatusMsg('Database reset — ' + new Date().toLocaleTimeString());
  };

  const handleLoadLab = () => {
    if (!window.confirm("Creates person1234 and orders1234 tables with data. Are you sure?")) return;
    loadLabDB(db);
    refreshSchema();
    setSqlOutput([
      { msg: 'Constraints Lab DB loaded: person1234 (4 rows), orders1234 (4 rows).', msgClass: 'ok' },
      { msg: 'Try: SELECT * FROM person1234;', msgClass: 'info' }
    ]);
    handleUpdateTabSql(activeTabId, 'SELECT * FROM person1234;');
    setStatusMsg('Constraints Lab DB loaded — ' + new Date().toLocaleTimeString());
  };

  const handleLoadJoins = () => {
    if (!window.confirm("Creates employees, departments, managers tables with exact data. Are you sure?")) return;
    loadJoinsDB(db);
    refreshSchema();
    setSqlOutput([
      { msg: 'Joins Lab DB loaded: employees (5), departments (3), managers (2).', msgClass: 'ok' },
      { msg: 'Try: SELECT e.first_name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.department_id;', msgClass: 'info' }
    ]);
    handleUpdateTabSql(activeTabId, 'SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;');
    setStatusMsg('Joins Lab DB loaded — ' + new Date().toLocaleTimeString());
  };

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
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleSelectSql = (sqlStr) => {
    handleUpdateTabSql(activeTabId, sqlStr);
  };

  const handleTableClick = (tableName) => {
    handleUpdateTabSql(activeTabId, `SELECT * FROM ${tableName};`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="ld-logo">ORACLE</div>
        <div className="ld-sub"><em>i</em>SQL*Home — College Edition</div>
        <div className="spinner"></div>
        <div className="ld-txt">Initializing SQLite engine…</div>
      </div>
    );
  }

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
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
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
            <button
              className={`mobile-nav-btn${mobilePanel === 'schema' ? ' active' : ''}`}
              onClick={() => setMobilePanel('schema')}
            >🗄️ Schema</button>
            <button
              className={`mobile-nav-btn${mobilePanel === 'workspace' ? ' active' : ''}`}
              onClick={() => setMobilePanel('workspace')}
            >⚡ SQL</button>
            <button
              className={`mobile-nav-btn${mobilePanel === 'lab' ? ' active' : ''}`}
              onClick={() => setMobilePanel('lab')}
            >📋 Lab</button>
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
