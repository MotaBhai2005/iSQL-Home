/* eslint-disable no-empty */
import React, { useState } from 'react';

const Sidebar = React.forwardRef(({ schema, onLoadLab, onLoadJoins, onReset, onTableClick, ...props }, ref) => {
  const [openTables, setOpenTables] = useState({});

  const toggleTable = (name) => {
    setOpenTables(prev => ({ ...prev, [name]: !prev[name] }));
    onTableClick(name);
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
                {tbl.name}
                <span className="badge">{tbl.rowCount} rows</span>
              </div>
              <div className="col-rows">
                {tbl.columns.map(col => {
                  const isPK = col[5] === 1;
                  const notNull = col[3] === 1;
                  return (
                    <div key={col[1]} className="col-row">
                      {isPK && <span className="col-pk">PK</span>}
                      <b>{col[1]}</b>
                      <span className="col-type">
                        {col[2] || ''}
                        {notNull && !isPK ? ' NN' : ''}
                      </span>
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
