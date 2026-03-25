/* eslint-disable no-empty */
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import localforage from 'localforage';
import {
  translateOracle,
  splitStatements,
  rewriteFullOuterJoin,
  rewriteRightJoin,
  getSuccessMsg,
  loadLabDB,
  loadJoinsDB
} from './db';

let db = null;

const enforceStrictTypes = (database) => {
  if (!database) return;
  try {
    const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (tables.length && tables[0].values.length) {
      tables[0].values.forEach(([tableName]) => {
        const cols = database.exec(`PRAGMA table_info("${tableName}")`);
        if (cols.length && cols[0].values) {
          const insertConds = [];
          cols[0].values.forEach(col => {
            const colName = col[1];
            const colType = (col[2] || '').toUpperCase();
            if (colType.includes('NUMBER') || colType.includes('DECIMAL') || colType.includes('INT') || colType.includes('NUMERIC')) {
              insertConds.push(`typeof(NEW."${colName}") NOT IN ('integer', 'real', 'null')`);
            } else if (colType.includes('DATE') || colType.includes('VARCHAR') || colType.includes('CHAR') || colType.includes('TEXT')) {
              insertConds.push(`typeof(NEW."${colName}") NOT IN ('text', 'null')`);
            }
          });
          if (insertConds.length > 0) {
            const cond = insertConds.join(' OR ');
            database.run(`CREATE TRIGGER IF NOT EXISTS "trg_strict_ins_${tableName}" BEFORE INSERT ON "${tableName}" BEGIN SELECT RAISE(ABORT, 'ORA-01722: invalid number or strict datatype enforcement failed') WHERE ${cond}; END;`);
            database.run(`CREATE TRIGGER IF NOT EXISTS "trg_strict_upd_${tableName}" BEFORE UPDATE ON "${tableName}" BEGIN SELECT RAISE(ABORT, 'ORA-01722: invalid number or strict datatype enforcement failed') WHERE ${cond}; END;`);
          }
        }
      });
    }
  } catch (e) {
    console.warn('Worker: Error enforcing strict types:', e);
  }
};

const saveDatabase = async () => {
  if (!db) return;
  try {
    const data = db.export();
    await localforage.setItem('isql_db_data', data);
  } catch (e) {
    console.warn('Worker: Error saving DB to IndexedDB:', e);
  }
};

const getRefreshSchema = () => {
  if (!db) return [];
  try {
    enforceStrictTypes(db);
    const res = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY type, name");
    if (!res.length || !res[0].values.length) return [];

    return res[0].values.map(([name, type]) => {
      let rowCount = 0;
      try { rowCount = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0]; } catch (e) {}
      let columns = [];
      let fks = [];
      try {
        const cols = db.exec(`PRAGMA table_info("${name}")`);
        if (cols.length) columns = cols[0].values;
        const fkData = db.exec(`PRAGMA foreign_key_list("${name}")`);
        if (fkData.length) fks = fkData[0].values;
      } catch (e) {}
      return { name, type, rowCount, columns, fks };
    });
  } catch (e) {
    console.error('Worker: Error refreshing schema', e);
    return [];
  }
};

const setupUDFs = () => {
  db.create_function('INITCAP', (str) => {
    if (!str) return str;
    return String(str).toLowerCase().replace(/(?:^|[^a-z0-9])[a-z]/gi, m => m.toUpperCase());
  });

  const lpadLogic = (str, n, pad) => String(str || '').padStart(n, pad || ' ');
  db.create_function('LPAD', function(a, b) { return lpadLogic(a, b); });
  db.create_function('LPAD', function(a, b, c) { return lpadLogic(a, b, c); });

  const rpadLogic = (str, n, pad) => String(str || '').padEnd(n, pad || ' ');
  db.create_function('RPAD', function(a, b) { return rpadLogic(a, b); });
  db.create_function('RPAD', function(a, b, c) { return rpadLogic(a, b, c); });

  db.create_function('MONTHS_BETWEEN', (d1, d2) => {
    if (!d1 || !d2) return null;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (date1.getFullYear() * 12 + date1.getMonth()) - (date2.getFullYear() * 12 + date2.getMonth());
  });

  db.create_function('LAST_DAY', (d) => {
    if (!d) return null;
    const parts = String(d).split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      return `${year}-${parts[1].padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
    return d;
  });

  db.create_function('NEXT_DAY', (d, dayStr) => {
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

  db.create_function('NEW_TIME', (d) => d);

  db.create_function('TO_CHAR', (val, fmt) => {
    if (!val) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const parts = val.split(' ')[0].split('-');
      const y = parts[0], m = parts[1];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if (fmt && fmt.includes('Month YYYY')) {
        const date = new Date(val);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${dayNames[date.getDay()]}, ${months[parseInt(m) - 1]} ${y}`;
      }
    }
    if (fmt && fmt.includes('$')) return '$' + val;
    return String(val);
  });

  db.create_function('TO_DATE', function(a) { return a; });
  db.create_function('TO_DATE', function(a, b) { return a; }); // eslint-disable-line no-unused-vars
  db.create_function('TO_NUMBER', (val) => Number(val));

  db.create_function('ADD_MONTHS', (d, n) => {
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
  db.create_function('TRUNC', function(a) { return truncLogic(a, 0); });
  db.create_function('TRUNC', function(a, b) { return truncLogic(a, b); });
};

self.onmessage = async (e) => {
  const { id, action, payload } = e.data;

  try {
    // ── INIT ──────────────────────────────────────────────────────
    if (action === 'INIT') {
      const SQL = await initSqlJs({
        locateFile: () => sqlWasmUrl
      });

      const savedData = await localforage.getItem('isql_db_data');
      if (savedData instanceof Uint8Array || (savedData && savedData.length > 0)) {
        db = new SQL.Database(savedData);
      } else {
        db = new SQL.Database();
      }

      setupUDFs();
      const schema = getRefreshSchema();
      self.postMessage({ id, success: true, schema });

    // ── RUN SQL ───────────────────────────────────────────────────
    } else if (action === 'RUN_SQL_LOCAL') {
      const { rawSql } = payload;
      const statements = splitStatements(rawSql);
      const newOutputs = [];
      let mutated = false;
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
              block.columns = r.columns.map(c => {
                if (c.toLowerCase() === "date('now')") return 'SYSDATE';
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
            mutated = true;
          }
        } catch (err) {
          block.msg = 'ERROR at line 1:\nORA-00000: ' + err.message;
          block.msgClass = 'err';
        }
        newOutputs.unshift(block);
      });

      if (mutated) await saveDatabase();
      const schema = mutated ? getRefreshSchema() : null;
      self.postMessage({ id, success: true, newOutputs, schema, mutated });

    // ── RESET DB ──────────────────────────────────────────────────
    } else if (action === 'RESET_DB') {
      const t = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      if (t.length) t[0].values.forEach(([n]) => { try { db.run(`DROP TABLE IF EXISTS "${n}"`); } catch (e) {} });
      const v = db.exec("SELECT name FROM sqlite_master WHERE type='view'");
      if (v.length) v[0].values.forEach(([n]) => { try { db.run(`DROP VIEW IF EXISTS "${n}"`); } catch (e) {} });
      await saveDatabase();
      self.postMessage({ id, success: true, schema: getRefreshSchema() });

    // ── LOAD LAB ──────────────────────────────────────────────────
    } else if (action === 'LOAD_LAB') {
      loadLabDB(db);
      await saveDatabase();
      self.postMessage({ id, success: true, schema: getRefreshSchema() });

    // ── LOAD JOINS ────────────────────────────────────────────────
    } else if (action === 'LOAD_JOINS') {
      loadJoinsDB(db);
      await saveDatabase();
      self.postMessage({ id, success: true, schema: getRefreshSchema() });

    // ── EXPORT SQL ────────────────────────────────────────────────
    } else if (action === 'EXPORT_SQL') {
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      if (!tables.length || !tables[0].values.length) {
        self.postMessage({ id, success: true, out: null });
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
        } catch (e) {}
      });
      self.postMessage({ id, success: true, out });
    }

  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};
