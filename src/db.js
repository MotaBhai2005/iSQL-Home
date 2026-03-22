/* eslint-disable no-empty */
export const translateOracle = (sql) => {
  let s = sql;
  s = s.replace(/\bNUMBER\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi, 'DECIMAL($1,$2)');
  s = s.replace(/\bNUMBER\s*\(\s*(\d+)\s*\)/gi, 'INTEGER');
  s = s.replace(/\bNUMBER\b/gi, 'NUMERIC');
  s = s.replace(/\bVARCHAR2\s*\((\d+)\)/gi, 'VARCHAR($1)');
  s = s.replace(/\bVARCHAR2\b/gi, 'TEXT');
  s = s.replace(/\bCHAR\s*\((\d+)\)/gi, 'VARCHAR($1)');
  s = s.replace(/^RENAME\s+(\w+)\s+TO\s+(\w+)\s*$/i, 'ALTER TABLE $1 RENAME TO $2');
  s = s.replace(/^TRUNCATE\s+TABLE\s+(\w+)\s*$/i, 'DELETE FROM $1');
  s = s.replace(/^DESC(?:RIBE)?\s+(\w+)\s*$/i, 'PRAGMA table_info($1)');
  s = s.replace(/\bSYSDATE\b/gi, "date('now')");
  s = s.replace(/\bTRIM\s*\(\s*'([^']+)'\s+FROM\s+([^)]+)\)/gi, "TRIM($2, '$1')");
  if (/^ALTER\s+TABLE\s+\w+\s+(DROP\s+CONSTRAINT|ADD\s+PRIMARY\s+KEY|ADD\s+FOREIGN\s+KEY|ADD\s+CHECK|ADD\s+CONSTRAINT)/i.test(s.trim())) {
    return `SELECT 1;`;
  }
  s = s.replace(/\bNVL\s*\(/gi, 'COALESCE(');
  s = s.replace(/\bFROM\s+DUAL\b/gi, '');
  s = s.replace(/\bREFERENCES\s+(\w+)\s*\((\w+)\)/gi, 'REFERENCES $1($2)');

  const months = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
    'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };
  s = s.replace(/'(\d{1,2})-([A-Z]{3,4})-(\d{2,4})'/gi, (match, d, m, y) => {
    const mm = months[m.toUpperCase().substring(0, 3)] || '01';
    const dd = d.padStart(2, '0');
    const yy = y.length === 2 ? (parseInt(y) < 50 ? '20' + y : '19' + y) : y;
    return `'${yy}-${mm}-${dd}'`;
  });

  return s;
};

export const rewriteFullOuterJoin = (sql) => {
  if (!/FULL\s+(OUTER\s+)?JOIN/i.test(sql)) return sql;

  let cleanSql = sql.trim();
  const hasSemi = cleanSql.endsWith(';');
  if (hasSemi) cleanSql = cleanSql.slice(0, -1);

  const regex = /^(SELECT\s+[\s\S]+?)\s+FROM\s+([\w\s]+?)\s+FULL\s+(?:OUTER\s+)?JOIN\s+([\w\s]+?)\s+ON\s+([\w\.]+)[\s]*=[\s]*([\w\.]+)([\s\S]*)$/i;
  const match = cleanSql.match(regex);

  if (match) {
    const [, sel, t1, t2, onLeft, onRight, rest] = match;
    const t1Alias = t1.trim().split(/\s+/).pop();
    const t1Key = onLeft.trim().startsWith(t1Alias + '.') ? onLeft.trim() : onRight.trim();
    const rewritten = `${sel} FROM ${t1} LEFT JOIN ${t2} ON ${onLeft} = ${onRight}${rest} UNION ALL ${sel} FROM ${t2} LEFT JOIN ${t1} ON ${onLeft} = ${onRight} WHERE ${t1Key} IS NULL${rest}`;
    return rewritten + (hasSemi ? ';' : '');
  }
  return sql;
};

export const rewriteRightJoin = (sql) => {
  if (!/RIGHT\s+(OUTER\s+)?JOIN/i.test(sql)) return sql;

  let cleanSql = sql.trim();
  const hasSemi = cleanSql.endsWith(';');
  if (hasSemi) cleanSql = cleanSql.slice(0, -1);

  const regex = /^(SELECT\s+[\s\S]+?)\s+FROM\s+([\w\s]+?)\s+RIGHT\s+(?:OUTER\s+)?JOIN\s+([\w\s]+?)\s+ON\s+([\w\.]+[\s]*=[\s]*[\w\.]+)([\s\S]*)$/i;
  const match = cleanSql.match(regex);

  if (match) {
    const [, sel, t1, t2, onCondition, rest] = match;
    const rewritten = `${sel} FROM ${t2} LEFT JOIN ${t1} ON ${onCondition}${rest}`;
    return rewritten + (hasSemi ? ';' : '');
  }
  return sql;
};

export const splitStatements = (raw) => {
  return raw.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
};

export const getSuccessMsg = (sql) => {
  const u = sql.trim().toUpperCase();
  if (u.startsWith('CREATE TABLE')) return 'Table created.';
  if (u.startsWith('CREATE VIEW')) return 'View created.';
  if (u.startsWith('CREATE INDEX')) return 'Index created.';
  if (u.startsWith('DROP TABLE')) return 'Table dropped.';
  if (u.startsWith('DROP VIEW')) return 'View dropped.';
  if (u.startsWith('DROP INDEX')) return 'Index dropped.';
  if (u.startsWith('INSERT')) return '1 row created.';
  if (u.startsWith('UPDATE')) return 'Row(s) updated.';
  if (u.startsWith('DELETE')) return 'Row(s) deleted.';
  if (u.startsWith('ALTER TABLE') && u.includes('RENAME')) return 'Table renamed.';
  if (u.startsWith('ALTER TABLE') && u.includes('DROP')) return 'Table altered. Constraint dropped.';
  if (u.startsWith('ALTER TABLE')) return 'Table altered.';
  if (u.startsWith('TRUNCATE') || u.startsWith('DELETE FROM') && !u.includes('WHERE')) return 'Table truncated.';
  if (u.startsWith('RENAME')) return 'Table renamed.';
  return 'Statement executed successfully.';
};

export const SNIPPETS = [
  'SELECT * FROM ', 'CREATE TABLE ', 'INSERT INTO ', 'UPDATE  SET ',
  'DELETE FROM ', 'ALTER TABLE ', 'DROP TABLE ', 'DESCRIBE ',
  'SELECT COUNT(*) FROM ', 'WHERE  = ', 'ORDER BY  DESC', 'GROUP BY ',
  'HAVING COUNT(*) > ', 'INNER JOIN  ON ', 'LEFT JOIN  ON ',
  'LIKE \'%\'', 'BETWEEN  AND ', 'IN ()', 'IS NULL', 'IS NOT NULL'
];

export const loadLabDB = (db) => {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS person1234 (p_id INT PRIMARY KEY, fname VARCHAR(20) NOT NULL, lname VARCHAR(20) NOT NULL, age INT CHECK(age>=18), salary DECIMAL(10,2) DEFAULT 10000, address VARCHAR(50))`,
    `INSERT OR IGNORE INTO person1234 VALUES(1,'Rahul','Sharma',25,30000,'Delhi')`,
    `INSERT OR IGNORE INTO person1234 VALUES(2,'Amit','Patel',30,40000,'Mumbai')`,
    `INSERT OR IGNORE INTO person1234 VALUES(3,'Neha','Singh',28,35000,'Bangalore')`,
    `INSERT OR IGNORE INTO person1234 VALUES(4,'Priya','Rao',22,28000,'Chennai')`,
    `CREATE TABLE IF NOT EXISTS orders1234 (oid INT PRIMARY KEY, order_no INT UNIQUE, p_id INT, FOREIGN KEY(p_id) REFERENCES person1234(p_id))`,
    `INSERT OR IGNORE INTO orders1234 VALUES(101,5001,1)`,
    `INSERT OR IGNORE INTO orders1234 VALUES(102,5002,2)`,
    `INSERT OR IGNORE INTO orders1234 VALUES(103,5003,1)`,
    `INSERT OR IGNORE INTO orders1234 VALUES(104,5004,3)`,
  ];
  stmts.forEach(s => { try { db.run(s); } catch (e) { console.warn(e); } });
};

export const loadJoinsDB = (db) => {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS departments (department_id INT PRIMARY KEY, department_name VARCHAR(100))`,
    `CREATE TABLE IF NOT EXISTS managers (manager_id INT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50))`,
    `CREATE TABLE IF NOT EXISTS employees (employee_id INT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), salary DECIMAL(10,2), department_id INT, manager_id INT, hire_date DATE)`,
    `INSERT OR IGNORE INTO departments VALUES(1,'IT'),(2,'Sales'),(3,'HR')`,
    `INSERT OR IGNORE INTO managers VALUES(1,'John','Doe'),(2,'Sarah','Lee')`,
    `INSERT OR IGNORE INTO employees VALUES(1,'Alice','Johnson',70000,1,NULL,'2020-03-10')`,
    `INSERT OR IGNORE INTO employees VALUES(2,'Bob','Smith',60000,2,1,'2019-05-15')`,
    `INSERT OR IGNORE INTO employees VALUES(3,'Carol','White',75000,1,1,'2018-07-22')`,
    `INSERT OR IGNORE INTO employees VALUES(4,'David','Brown',55000,3,NULL,'2021-01-25')`,
    `INSERT OR IGNORE INTO employees VALUES(5,'Eve','Black',80000,2,2,'2021-04-01')`,
  ];
  stmts.forEach(s => { try { db.run(s); } catch (e) { console.warn(e); } });
};
