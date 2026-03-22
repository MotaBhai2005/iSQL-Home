const fs = require('fs');

const { translateOracle } = require('./src/db.js');

const query = `INSERT INTO employees VALUES (3,'Carol','White',75000,1,1,'22-JUL-2018');`;

console.log("Original:", query);
console.log("Translated:", translateOracle(query));
