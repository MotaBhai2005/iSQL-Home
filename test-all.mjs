import initSqlJs from 'sql.js';
import { LAB_DATA } from './src/dbData.js';
import { translateOracle, splitStatements, rewriteFullOuterJoin, rewriteRightJoin } from './src/db.js';

initSqlJs().then(SQL => {
    const db = new SQL.Database();

    // Replicate App.jsx implementations
    db.create_function('INITCAP', (str) => {
        if (!str) return str;
        return String(str).toLowerCase().replace(/(?:^|[^a-z0-9])[a-z]/gi, m => m.toUpperCase());
    });
    const lpadLogic = (str, n, pad) => String(str).padStart(n, pad || ' ');
    db.create_function('LPAD', function (a, b) { return lpadLogic(a, b); });
    db.create_function('LPAD', function (a, b, c) { return lpadLogic(a, b, c); });
    const rpadLogic = (str, n, pad) => String(str).padEnd(n, pad || ' ');
    db.create_function('RPAD', function (a, b) { return rpadLogic(a, b); });
    db.create_function('RPAD', function (a, b, c) { return rpadLogic(a, b, c); });
    db.create_function('MONTHS_BETWEEN', (d1, d2) => {
        if (!d1 || !d2) return null;
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return (date1.getFullYear() * 12 + date1.getMonth()) - (date2.getFullYear() * 12 + date2.getMonth());
    });
    db.create_function('LAST_DAY', (d) => {
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
    db.create_function('NEW_TIME', (d, z1, z2) => d); // Mock
    db.create_function('TO_CHAR', (val, fmt) => {
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
    db.create_function('TO_DATE', (val) => val);
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
    db.create_function('TRUNC', function (a) { return truncLogic(a, 0); });
    db.create_function('TRUNC', function (a, b) { return truncLogic(a, b); });

    // TEST ALL QUERIES
    const errors = [];
    for (const labKey in LAB_DATA) {
        if (!LAB_DATA[labKey].questions) continue;
        LAB_DATA[labKey].questions.forEach((q, i) => {
            const rawSql = q.a;
            splitStatements(rawSql).forEach(sql => {
                try {
                    let translatedSQL = translateOracle(sql);
                    translatedSQL = rewriteFullOuterJoin(translatedSQL);
                    translatedSQL = rewriteRightJoin(translatedSQL);

                    if (/^(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(translatedSQL.trim())) {
                        db.exec(translatedSQL);
                    } else {
                        db.run(translatedSQL);
                    }
                } catch (e) {
                    errors.push(`Error executing [${labKey} Q${i + 1}] ${sql}: ${e.message}`);
                }
            });
        });
    }

    if (errors.length > 0) {
        console.log("ERRORS FOUND:");
        console.log(errors.join('\\n'));
    } else {
        console.log("ALL QUERIES PASSED!");
    }
});
