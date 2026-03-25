import React, { useState } from 'react';

const Sidebar = React.forwardRef(({ schema, onLoadLab, onLoadJoins, onReset, onTableClick, ...props }, ref) => {
  const [openTables, setOpenTables] = useState({});

  const toggleTable = (name) => {
    setOpenTables(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className={`sidebar ${props.className || ''}`} style={props.style} ref={ref}>
      <div className="sidebar-header">📋 Schema Browser</div>
      <div className="section-label">Tables / Views</div>

      <div className="table-scroll">
        {schema.length === 0 ? (
          <div className="no-tables">No tables yet.<br />Create one to begin.</div>
        ) : (
          schema.map(tbl => (
            <div key={tbl.name} className={`tbl-entry ${openTables[tbl.name] ? 'open' : ''}`}>
              <div className="tbl-name" onClick={() => toggleTable(tbl.name)}>
                <span className="ico">{tbl.type === 'view' ? '👁' : '▦'}</span>
                <span>{tbl.name}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      title={`Run SELECT * FROM ${tbl.name}`}
                      style={{ background: 'var(--oracle-blue2)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', padding: '2px 5px', fontWeight: 'bold' }} 
                      onClick={(e) => { e.stopPropagation(); onTableClick(tbl.name); }}
                    >
                      QUERY
                    </button>
                    <span className="badge" style={{ marginLeft: 0 }}>{tbl.rowCount} rows</span>
                </span>
              </div>
              <div className="col-rows">
                {tbl.columns.map(col => {
                  const isPK = col[5] === 1;
                  const nn = col[3] === 1;
                  const fk = tbl.fks ? tbl.fks.find(f => f[3] === col[1]) : null;
                  return (
                    <div key={col[1]} className="sch-col">
                      {isPK && <span className="sch-pk" title="Primary Key">PK</span>}
                      {fk && <span className="sch-fk" title={`Foreign Key referencing ${fk[2]}.${fk[4]}`}>FK</span>}
                      <b>{col[1]}</b>
                      <span className="sch-ct">{col[2] || ''}</span>
                      {nn && !isPK && <span className="sch-nn" title="Not Null">NN</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="s-btn" onClick={onLoadLab}>📂 Load Lab Sample DB</button>
        <button className="s-btn" onClick={onLoadJoins}>🔗 Load Joins Sample DB</button>
        <button className="s-btn danger" onClick={onReset}>🗑 Reset Database</button>
      </div>
    </div>
  );
});

export default Sidebar;
