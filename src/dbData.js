export const LAB_DATA = {
    sql1: {
        note: 'From sql1.pdf — DDL & DML Basics. Data types: NUMBER, VARCHAR2, CHAR, DATE.',
        questions: [
            {
                q: 'Create a table named EMPLOYEE with 8 columns: emp_id, lname, fname, doj (date), salary, commission, dept_id, building name.',
                a: `CREATE TABLE EMPLOYEE(\n  emp_id NUMBER(4),\n  lname VARCHAR2(10),\n  fname VARCHAR2(10),\n  doj DATE,\n  sal NUMBER(10),\n  comm NUMBER(10),\n  dept_id NUMBER(4),\n  bd_name VARCHAR2(10)\n);`
            },
            {
                q: 'Insert five rows into the EMPLOYEE table.',
                a: `INSERT INTO EMPLOYEE VALUES(111,'SMITH','JOHN','4-SEP-10',26500,3500,10,'GANDHI');\nINSERT INTO EMPLOYEE VALUES(246,'Hostom','LARY','10-AUG-09',45000,10000,4,'GANDHI');\nINSERT INTO EMPLOYEE VALUES(123,'ROBERT','SANDY','12-JUL-11',75000,NULL,10,'KENEEDY');\nINSERT INTO EMPLOYEE VALUES(433,'MCKAUL','ALEX','17-MAY-08',66000,NULL,20,'KENEEDY');\nINSERT INTO EMPLOYEE VALUES(456,'EVENS','DANA','18-OCT-10',25000,1000,786,'DURGA');`
            },
            { q: 'Display the structure of the EMPLOYEE table.', a: `DESCRIBE EMPLOYEE;` },
            { q: 'Display all rows from EMPLOYEE.', a: `SELECT * FROM EMPLOYEE;` },
            { q: 'Alter EMPLOYEE — add a new column mobile NUMBER(10).', a: `ALTER TABLE EMPLOYEE ADD mobile NUMBER(10);` },
            { q: 'Add mobile number for emp_id = 111.', a: `UPDATE EMPLOYEE SET mobile = 9876543210 WHERE emp_id = 111;` },
            { q: 'Delete the EMPLOYEE record having emp_id = 123.', a: `DELETE FROM EMPLOYEE WHERE emp_id = 123;` },
            { q: 'Rename the table EMPLOYEE to EMP.', a: `RENAME EMPLOYEE TO EMP;` },
            { q: 'Remove all records from EMP table (keep structure).', a: `TRUNCATE TABLE EMP;` },
            { q: 'Delete the EMP table from the database permanently.', a: `DROP TABLE EMP;` },
        ]
    },
    sql2: {
        note: 'From SQL2LAB.pdf — Complete employee lifecycle (1 through 20).',
        questions: [
            {
                q: 'Create a table named EMPLOYEE with 8 columns in it emp_id,lname,fname,data of joinin,salary,commission, dept_id , building name.',
                a: `CREATE TABLE EMPLOYEE(emp_id number(4), lname varchar2(10), fname varchar2(10),doj date, sal number(10), comm number(10), dept_id number(4), bd_name varchar2(10));`
            },
            {
                q: 'Insert five rows into the table.',
                a: `INSERT INTO EMPLOYEE values(111,'SMITH','JOHN','4-SEP-10',26500,3500,10,'GANDHI');\nINSERT INTO EMPLOYEE values(246,'Hostom','LARY','10-AUG-09',45000,10000,4,'GANDHI');\nINSERT INTO EMPLOYEE values(123,'ROBERT','SANDY','12-JULY-11',75000,NULL,10,'KENEEDY');\nINSERT INTO EMPLOYEE values(433,'MCKAUL','ALEX','17-MAY-08',66000,NULL,20,'KENEEDY');\nINSERT INTO EMPLOYEE values(456,'EVENS','DANA','18-OCT-10',25000,1000,786,'DURGA');`
            },
            {
                q: 'Display all employee names (Lname and Fname separated by comma and a space) and salary with appropriate column alias as employee salary details.',
                a: `SELECT lname || ', ' || fname AS "employee salary details", sal FROM EMPLOYEE;`
            },
            {
                q: 'Display all employee name who do not get any commission.',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE comm IS NULL;`
            },
            {
                q: 'Display unique building name from the employee table.',
                a: `SELECT DISTINCT bd_name FROM EMPLOYEE;`
            },
            {
                q: 'Display name of the employees who work in department 10 or 20',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE dept_id IN (10, 20);`
            },
            {
                q: 'Find all Gandhi and Kennedy building employees.',
                a: `SELECT * FROM EMPLOYEE WHERE bd_name IN ('GANDHI', 'KENEEDY');`
            },
            {
                q: 'Give a 10 % raise to the employee with emp_id =111',
                a: `UPDATE EMPLOYEE SET sal = sal * 1.10 WHERE emp_id = 111;`
            },
            {
                q: 'Find the employee name whos last name starts with letter H',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE lname LIKE 'H%';`
            },
            {
                q: 'Display the name of the employee having C as the second letter in the last name.',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE lname LIKE '_C%';`
            },
            {
                q: 'List all the employee name who’s salary is >26000 and <66000',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE sal > 26000 AND sal < 66000;`
            },
            {
                q: 'List employee name who’s salary is >25000 and staying in Gandhi building.',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE sal > 25000 AND bd_name = 'GANDHI';`
            },
            {
                q: 'Add a new column mobile number to EMPLOYEE table .',
                a: `ALTER TABLE EMPLOYEE ADD mobile NUMBER(10);`
            },
            {
                q: 'Add mobile number of the employee having id=111.',
                a: `UPDATE EMPLOYEE SET mobile = 9876543210 WHERE emp_id = 111;`
            },
            {
                q: 'Change the mobile number of the employee having id 111.',
                a: `UPDATE EMPLOYEE SET mobile = 9999999999 WHERE emp_id = 111;`
            },
            {
                q: 'List the employee names who joined in the month of September.',
                a: `SELECT fname, lname FROM EMPLOYEE WHERE strftime('%m', doj) = '09';\n-- Or Oracle format: WHERE TO_CHAR(doj, 'MON') = 'SEP'`
            },
            {
                q: 'Delete the EMPLOYEE record having emp_id=123.',
                a: `DELETE FROM EMPLOYEE WHERE emp_id = 123;`
            },
            {
                q: 'Rename the table EMPLOYEE to EMP.',
                a: `RENAME EMPLOYEE TO EMP;`
            },
            {
                q: 'Remove all the record from EMP table.',
                a: `TRUNCATE TABLE EMP;`
            },
            {
                q: 'Delete the Employee table from database.',
                a: `DROP TABLE EMP;`
            }
        ]
    },
    sql3: {
        note: 'From SQL3.pdf — Single-row functions: String, Numeric, Date.',
        questions: [
            {
                q: '1) Create a table having attributes fname, lname, emp_id, deptno, job, sal.',
                a: `CREATE TABLE empnew (\n  fname VARCHAR2(10),\n  lname VARCHAR2(10),\n  emp_id NUMBER(4),\n  deptno NUMBER(4),\n  job VARCHAR2(15),\n  sal NUMBER(10)\n);`
            },
            {
                q: '2) Insert 5 rows into the table.',
                a: `INSERT INTO empnew VALUES('Ruchi','Agarwal',234,10,'Manager',30000);\nINSERT INTO empnew VALUES('Riya','Sen',123,10,'Sales person',10000);\nINSERT INTO empnew VALUES('Piyush','Garg',467,20,'Peon',1000);\nINSERT INTO empnew VALUES('Raghu','Ram',892,20,'Manager',25000);\nINSERT INTO empnew VALUES('Ashish','Sharma',111,20,'Sales person',1500);`
            },
            {
                q: '3) Write a query which will display department wise sum of sal, max of sal and min of sal and count the no. of records in each group.',
                a: `SELECT deptno,\n  SUM(sal) AS total_sal,\n  MAX(sal) AS max_sal,\n  MIN(sal) AS min_sal,\n  COUNT(*) AS emp_count\nFROM empnew\nGROUP BY deptno;`
            },
            {
                q: '4) Write a query which will display the dept wise sum of sal, max of sal, min of sal whose max(sal) >=2000',
                a: `SELECT deptno, SUM(sal), MAX(sal), MIN(sal)\nFROM empnew\nGROUP BY deptno\nHAVING MAX(sal) >= 2000;`
            },
            {
                q: '5) Display dept wise, job wise sum of sal, max of sal of those group whose max sal is >=2000 but it will not display the info of deptno 20.',
                a: `SELECT deptno, job, SUM(sal), MAX(sal)\nFROM empnew\nWHERE deptno <> 20\nGROUP BY deptno, job\nHAVING MAX(sal) >= 2000;`
            },
            {
                q: '6) Display all emp names with initial letter in capital form.',
                a: `SELECT INITCAP(fname), INITCAP(lname) FROM empnew;`
            },
            {
                q: '7) Display the current date of your system.',
                a: `SELECT SYSDATE FROM DUAL;`
            },
            {
                q: '8) Write a query to round off 25.434 upto 2 decimal places.',
                a: `SELECT ROUND(25.434, 2) FROM DUAL;`
            },
            {
                q: '9) Find out the sign of -5.5',
                a: `SELECT SIGN(-5.5) FROM DUAL;`
            },
            {
                q: 'LOWER: All the letters in string are converted to lowercase.',
                a: `SELECT LOWER('Good Morning') FROM DUAL;`
            },
            {
                q: 'UPPER: All the letters in string are converted to uppercase.',
                a: `SELECT UPPER('Good Morning') FROM DUAL;`
            },
            {
                q: 'INITCAP: All the letters in string are converted to mixed case.',
                a: `SELECT INITCAP('GOOD MORNING') FROM DUAL;`
            },
            {
                q: 'LTRIM: All occurrences of trim_text are removed from the left.',
                a: `SELECT LTRIM('Good Morning', 'Good') FROM DUAL;`
            },
            {
                q: 'RTRIM: All occurrences of trim_text are removed from the right.',
                a: `SELECT RTRIM('Good Morning', ' Morning') FROM DUAL;`
            },
            {
                q: 'TRIM: All occurrences of trim_text from the left and right.',
                a: `SELECT TRIM('o' FROM 'Good Morning') FROM DUAL;`
            },
            {
                q: 'SUBSTR: Returns n number of characters starting from m position.',
                a: `SELECT SUBSTR('Good Morning', 6, 7) FROM DUAL;`
            },
            {
                q: 'LENGTH: Number of characters in string returned.',
                a: `SELECT LENGTH('Good Morning') FROM DUAL;`
            },
            {
                q: 'LPAD: Returns string left-padded with pad_value.',
                a: `SELECT LPAD('Good', 6, '*') FROM DUAL;`
            },
            {
                q: 'RPAD: Returns string right-padded with pad_value.',
                a: `SELECT RPAD('Good', 6, '*') FROM DUAL;`
            },
            {
                q: 'ABS: Absolute value of the number.',
                a: `SELECT ABS(-5.5) FROM DUAL;`
            },
            {
                q: 'CEIL: Integer value that is Greater than or equal to the number.',
                a: `SELECT CEIL(5.5) FROM DUAL;`
            },
            {
                q: 'FLOOR: Integer value that is Less than or equal to the number.',
                a: `SELECT FLOOR(5.5) FROM DUAL;`
            },
            {
                q: 'TRUNC: Truncates value of number up to y decimal places.',
                a: `SELECT TRUNC(25.434, 2) FROM DUAL;`
            },
            {
                q: 'ROUND: Rounded off value of the number up to y decimal places.',
                a: `SELECT ROUND(25.434, 2) FROM DUAL;`
            },
            {
                q: 'SYSDATE: Returns the systems current date and time.',
                a: `SELECT SYSDATE FROM DUAL;`
            },
            {
                q: 'ADD_MONTHS: Returns a date value after adding n months.',
                a: `SELECT ADD_MONTHS('16-SEP-81', 3) FROM DUAL;`
            },
            {
                q: 'MONTHS_BETWEEN: Returns the number of months between dates.',
                a: `SELECT MONTHS_BETWEEN('16-SEP-81', '16-DEC-81') FROM DUAL;`
            },
            {
                q: 'NEXT_DAY: Returns the next date of the week_day on or after the date occurs.',
                a: `SELECT NEXT_DAY('01-JUN-08', 'Wednesday') FROM DUAL;`
            },
            {
                q: 'LAST_DAY: Determines the number of days remaining in a month.',
                a: `SELECT LAST_DAY('01-JUN-08') FROM DUAL;`
            },
            {
                q: 'NEW_TIME: Returns the date and time in zone2 if date represents time in zone1.',
                a: `SELECT NEW_TIME('01-JUN-08', 'IST', 'EST') FROM DUAL;`
            },
            {
                q: 'TO_CHAR: Converts Numeric and Date values to a character string value.',
                a: `SELECT TO_CHAR(3000, '$9999') FROM DUAL;\nSELECT TO_CHAR(SYSDATE, 'Day, Month YYYY') FROM DUAL;`
            },
            {
                q: 'TO_DATE: Converts a valid Numeric and Character values to a Date value.',
                a: `SELECT TO_DATE('01-Jun-08') FROM DUAL;`
            },
            {
                q: 'NVL: If x is NULL, replace it with y.',
                a: `SELECT NVL(null, 1) FROM DUAL;`
            }
        ]
    },
    subquery: {
        note: 'From subquery.pdf — ORDER BY, Subqueries (single & multi-row), CREATE AS SELECT, INSERT/UPDATE/DELETE with subquery.',
        questions: [
            {
                q: 'Create table deptnew with attributes deptno and deptname.',
                a: `CREATE TABLE deptnew (\n  deptno NUMBER(4),\n  deptname VARCHAR2(10)\n);`
            },
            {
                q: 'Insert 3 rows into deptnew.',
                a: `INSERT INTO deptnew VALUES(10,'Production');\nINSERT INTO deptnew VALUES(20,'Supplies');\nINSERT INTO deptnew VALUES(30,'Marketing');`
            },
            {
                q: 'Create table empnew with attributes: deptno, deptname.',
                a: `DROP TABLE IF EXISTS empnew;\nCREATE TABLE empnew(\n  empno NUMBER(3),\n  fname VARCHAR2(10),\n  lname VARCHAR2(5),\n  deptno NUMBER(4),\n  sal NUMBER(8)\n);`
            },
            {
                q: 'Insert 5 rows into empnew.',
                a: `INSERT INTO empnew VALUES(1,'X','A',10,20000);\nINSERT INTO empnew VALUES(2,'Y','B',20,30000);\nINSERT INTO empnew VALUES(3,'Z','C',30,40000);\nINSERT INTO empnew VALUES(4,'P','D',20,20000);\nINSERT INTO empnew VALUES(5,'Q','E',10,15000);`
            },
            {
                q: 'Display employees of X\'s department (subquery).',
                a: `SELECT * FROM empnew\nWHERE deptno = (\n  SELECT deptno FROM empnew WHERE fname = 'X'\n);`
            },
            {
                q: 'Display records where salary is same as X\'s salary.',
                a: `SELECT * FROM empnew\nWHERE sal = (\n  SELECT sal FROM empnew WHERE fname = 'X'\n);`
            },
            {
                q: 'Display records whose sal is BETWEEN Q\'s salary and Y\'s salary.',
                a: `SELECT * FROM empnew\nWHERE sal BETWEEN\n  (SELECT sal FROM empnew WHERE fname = 'Q')\n  AND\n  (SELECT sal FROM empnew WHERE fname = 'Y');`
            },
            {
                q: 'Create table temp from empnew where employees belong to deptno 10.',
                a: `CREATE TABLE temp AS\n  SELECT empno, fname, lname, deptno, sal\n  FROM empnew\n  WHERE deptno = 10;`
            },
            {
                q: 'Insert 4 columns (fname, lname, empno, deptno) to temp from empnew where deptno = 20.',
                a: `INSERT INTO temp (fname, lname, empno, deptno)\n  SELECT fname, lname, empno, deptno\n  FROM empnew\n  WHERE deptno = 20;`
            },
            {
                q: 'Increase salary of Production department by 10%.',
                a: `UPDATE empnew\nSET sal = sal * 1.10\nWHERE deptno = (\n  SELECT deptno FROM deptnew WHERE deptname = 'Production'\n);`
            },
            {
                q: 'Display employee names in descending order.',
                a: `SELECT fname, lname FROM empnew ORDER BY fname DESC;`
            },
            {
                q: 'Remove all records of Marketing department.',
                a: `DELETE FROM empnew\nWHERE deptno = (\n  SELECT deptno FROM deptnew WHERE deptname = 'Marketing'\n);`
            },
        ]
    },
    constraints: {
        note: 'From CONSTRAINT.pdf — NOT NULL, DEFAULT, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK. ALTER to add/drop.',
        questions: [
            {
                q: 'Create table person with p_id (PK), fname (NOT NULL), lname (NOT NULL), age (CHECK >=18), salary (DEFAULT 10000), address. Insert 3 rows.',
                a: `CREATE TABLE person1234 (\n  p_id INT PRIMARY KEY,\n  fname VARCHAR(20) NOT NULL,\n  lname VARCHAR(20) NOT NULL,\n  age INT CHECK (age >= 18),\n  salary DECIMAL(10,2) DEFAULT 10000,\n  address VARCHAR(50)\n);\nINSERT INTO person1234 VALUES(1,'Rahul','Sharma',25,30000,'Delhi');\nINSERT INTO person1234 VALUES(2,'Amit','Patel',30,40000,'Mumbai');\nINSERT INTO person1234 VALUES(3,'Neha','Singh',28,35000,'Bangalore');`
            },
            {
                q: 'Create table orders with oid (PK), order_no (UNIQUE), p_id (FK → person1234). Insert 4 rows.',
                a: `CREATE TABLE orders1234 (\n  oid INT PRIMARY KEY,\n  order_no INT UNIQUE,\n  p_id INT,\n  FOREIGN KEY (p_id) REFERENCES person1234(p_id)\n);\nINSERT INTO orders1234 VALUES(101,5001,1);\nINSERT INTO orders1234 VALUES(102,5002,2);\nINSERT INTO orders1234 VALUES(103,5003,1);\nINSERT INTO orders1234 VALUES(104,5004,3);`
            },
            {
                q: 'Add a CHECK constraint (age >= 18) to existing person table.',
                a: `ALTER TABLE person1234\nADD CONSTRAINT person_age_check CHECK (age >= 18);`
            },
            {
                q: 'Drop the constraint named person_age_check from person table.',
                a: `ALTER TABLE person1234\nDROP CONSTRAINT person_age_check;`
            },
            {
                q: 'Create a table student with columns s_id (NUMBER) and s_name (VARCHAR2).',
                a: `CREATE TABLE student (\n  s_id NUMBER,\n  s_name VARCHAR2(50)\n);`
            },
            {
                q: 'Add PRIMARY KEY to student table on column s_id.',
                a: `ALTER TABLE student ADD PRIMARY KEY(s_id);`
            },
            {
                q: 'Add FOREIGN KEY c_id to order_detail referencing Customer_Detail.',
                a: `ALTER TABLE order_detail\nADD FOREIGN KEY(c_id) REFERENCES Customer_Detail(c_id);`
            },
            {
                q: 'Add CHECK constraint on student (s_id > 0).',
                a: `ALTER TABLE student ADD CHECK(s_id > 0);`
            },
        ]
    },
    joins: {
        note: 'From joins.pdf — INNER, LEFT, RIGHT, FULL OUTER, SELF, CROSS JOIN, Aggregate with JOIN.',
        questions: [
            {
                q: 'Setup: Create employees, departments, managers tables with sample data.',
                a: `CREATE TABLE departments (department_id NUMBER PRIMARY KEY,department_name VARCHAR2(100));\nCREATE TABLE managers (manager_id NUMBER PRIMARY KEY,first_name VARCHAR2(50),last_name VARCHAR2(50));\nCREATE TABLE employees (employee_id NUMBER PRIMARY KEY,first_name VARCHAR2(50),last_name VARCHAR2(50),salary NUMBER(10,2),department_id NUMBER,manager_id NUMBER,hire_date DATE);\n\nINSERT INTO departments VALUES(1,'IT'),(2,'Sales'),(3,'HR');\nINSERT INTO managers VALUES(1,'John','Doe'),(2,'Sarah','Lee');\nINSERT INTO employees VALUES (1,'Alice','Johnson',70000,1,NULL,TO_DATE('10-MAR-2020','DD-MON-YYYY'));\nINSERT INTO employees VALUES (2,'Bob','Smith',60000,2,1,'15-MAY-2019');\nINSERT INTO employees VALUES (3,'Carol','White',75000,1,1,'22-JUL-2018');\nINSERT INTO employees VALUES (4,'David','Brown',55000,3,NULL,'25-JAN-2021');\nINSERT INTO employees VALUES (5,'Eve','Black',80000,2,2,'01-APR-2021');`
            },
            {
                q: 'INNER JOIN: employees with their department names.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;`
            },
            {
                q: 'LEFT JOIN: all employees including those with no department.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;`
            },
            {
                q: 'RIGHT JOIN: all departments including those with no employees.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nRIGHT JOIN departments d ON e.department_id = d.department_id;`
            },
            {
                q: 'FULL OUTER JOIN: all employees and all departments.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nFULL OUTER JOIN departments d ON e.department_id = d.department_id;`
            },
            {
                q: 'JOIN with 3 tables: employees, departments, managers.',
                a: `SELECT e.first_name AS emp_fname, e.last_name AS emp_lname,\n  d.department_name,\n  m.first_name AS mgr_fname, m.last_name AS mgr_lname\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nLEFT JOIN managers m ON e.manager_id = m.manager_id;`
            },
            {
                q: 'JOIN with condition: employees earning more than 60000.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nWHERE e.salary > 60000;`
            },
            {
                q: 'SELF JOIN: employees who are also managers.',
                a: `SELECT e1.first_name, e1.last_name, e1.manager_id\nFROM employees e1\nINNER JOIN employees e2 ON e1.employee_id = e2.manager_id;`
            },
            {
                q: 'JOIN with Aggregate: total employees per department.',
                a: `SELECT d.department_name, COUNT(e.employee_id) AS total_employees\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nGROUP BY d.department_name;`
            },
            {
                q: 'CROSS JOIN: all combinations of employees and departments.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nCROSS JOIN departments d;`
            },
            {
                q: 'JOIN with Subquery: Write a SQL query to retrieve employees who work in departments that have more than 5 employees. Use a JOIN and a subquery to solve this.',
                a: `SELECT e.first_name, e.last_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nWHERE d.department_id IN (SELECT department_id\nFROM employees\nGROUP BY department_id\nHAVING COUNT(employee_id) > 5);`
            },
            {
                q: 'JOIN with alias: employee name and their manager name.',
                a: `SELECT e.first_name AS employee_name, m.first_name AS manager_name\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;`
            },
            {
                q: 'JOIN with Non-Equality Condition: Write a SQL query to retrieve employees whose salaries are higher than the average salary in their department. Use a JOIN with a subquery.',
                a: `SELECT e.first_name, e.last_name, e.salary, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nWHERE e.salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id);`
            },
            {
                q: 'JOIN with date range: employees hired after Jan 1, 2020.',
                a: `SELECT e.first_name, e.last_name, e.hire_date, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id\nWHERE e.hire_date > '01-JAN-2020';`
            }
        ]
    },
    setops: {
        note: 'From Set Operations — UNION, UNION ALL, INTERSECT, MINUS/EXCEPT.',
        questions: [
            {
                q: 'Setup: Create tables Customer and Orders with a single column customer_id and insert overlapping data.',
                a: `CREATE TABLE Customer (customer_id NUMBER);\nCREATE TABLE Orders (customer_id NUMBER);\nINSERT INTO Customer VALUES (1), (2), (3);\nINSERT INTO Orders VALUES (2), (3), (4);`
            },
            {
                q: 'UNION: Get a unique list of all customer IDs from both the Customer and Orders tables.',
                a: `SELECT customer_id FROM Customer\nUNION\nSELECT customer_id FROM Orders;`
            },
            {
                q: 'UNION ALL: Combine all customer IDs from both tables seamlessly, retaining all duplicates.',
                a: `SELECT customer_id FROM Customer\nUNION ALL\nSELECT customer_id FROM Orders;`
            },
            {
                q: 'INTERSECT: Find only the registered customers who have successfully placed an order.',
                a: `SELECT customer_id FROM Customer\nINTERSECT\nSELECT customer_id FROM Orders;`
            },
            {
                q: 'EXCEPT (MINUS): Find registered customers who have NOT placed any orders.',
                a: `SELECT customer_id FROM Customer\nEXCEPT\nSELECT customer_id FROM Orders;\n-- Note: In Oracle this operator is called MINUS, but SQLite uses the ANSI standard EXCEPT.`
            }
        ]
    }
};

export const SYNTAX_SECTIONS = [
    {
        title: 'DDL — Create / Alter / Drop', items: [
            { s: `CREATE TABLE t (\n  col1 NUMBER(4),\n  col2 VARCHAR2(20) NOT NULL,\n  col3 DATE,\n  PRIMARY KEY (col1)\n);` },
            { s: `ALTER TABLE t ADD col4 NUMBER(5);` },
            { s: `ALTER TABLE t ADD PRIMARY KEY(col1);` },
            { s: `ALTER TABLE t ADD FOREIGN KEY(c_id) REFERENCES other(c_id);` },
            { s: `ALTER TABLE t ADD CHECK(age >= 18);` },
            { s: `ALTER TABLE t DROP CONSTRAINT cname;` },
            { s: `RENAME old_name TO new_name;` },
            { s: `TRUNCATE TABLE t;` },
            { s: `DROP TABLE t;` },
            { s: `DESCRIBE tablename;` },
        ]
    },
    {
        title: 'DML — Insert / Update / Delete', items: [
            { s: `INSERT INTO t VALUES(val1, val2, ...);` },
            { s: `INSERT INTO t (col1, col2) VALUES(v1, v2);` },
            { s: `UPDATE t SET col = val WHERE condition;` },
            { s: `DELETE FROM t WHERE condition;` },
        ]
    },
    {
        title: 'DQL — Select & Operators', items: [
            { s: `SELECT col1, col2 FROM t WHERE condition\nORDER BY col1 DESC;` },
            { s: `SELECT DISTINCT col FROM t;` },
            { s: `SELECT col1 || ', ' || col2 AS alias FROM t;` },
            { s: `WHERE sal BETWEEN 2000 AND 3000` },
            { s: `WHERE job IN ('Manager','Peon')` },
            { s: `WHERE ename LIKE 'S%'` },
            { s: `WHERE comm IS NULL` },
        ]
    },
    {
        title: 'GROUP BY / HAVING', items: [
            { s: `SELECT deptno, SUM(sal)\nFROM employee\nGROUP BY deptno\nHAVING SUM(sal) > 25000;` },
        ]
    },
    {
        title: 'Subqueries', items: [
            { s: `SELECT * FROM emp\nWHERE sal > (SELECT sal FROM emp WHERE ename='X');` },
            { s: `CREATE TABLE temp AS\n  SELECT * FROM emp WHERE deptno=10;` },
            { s: `INSERT INTO temp (col1)\n  SELECT col1 FROM emp WHERE deptno=20;` },
            { s: `UPDATE emp SET sal=sal*1.10\nWHERE deptno=(SELECT deptno FROM dept WHERE dname='FINANCE');` },
            { s: `DELETE FROM emp\nWHERE deptno=(SELECT deptno FROM dept WHERE dname='MARKETING');` },
        ]
    },
    {
        title: 'Joins', items: [
            { s: `SELECT e.fname, d.dname\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id;` },
            { s: `LEFT JOIN  |  RIGHT JOIN  |  CROSS JOIN\n(* use LEFT JOIN on right table for SQLite)` },
            { s: `-- SELF JOIN\nSELECT e1.fname, e2.fname AS manager\nFROM employees e1\nLEFT JOIN employees e2 ON e1.manager_id = e2.emp_id;` },
        ]
    },
    {
        title: 'String Functions', items: [
            { s: `LOWER(str) — Convert to lowercase\nUPPER(str) — Convert to uppercase\nINITCAP(str) — Convert to mixed case` },
            { s: `LTRIM(str, txt) — Remove txt from left\nRTRIM(str, txt) — Remove txt from right\nTRIM(txt FROM str) — Remove txt from both sides` },
            { s: `SUBSTR(str, m, n) — Get n chars from m\nLENGTH(str) — Number of characters` },
            { s: `LPAD(str, len, pad) — Left-pad to len\nRPAD(str, len, pad) — Right-pad to len` },
        ]
    },
    {
        title: 'Numeric Functions', items: [
            { s: `ABS(x) — Absolute value\nSIGN(x) — Returns -1, 0, or 1` },
            { s: `CEIL(x) — Smallest integer >= x\nFLOOR(x) — Largest integer <= x` },
            { s: `ROUND(x, y) — Round to y decimal places\nTRUNC(x, y) — Truncate to y decimal places` },
        ]
    },
    {
        title: 'Date & Misc Functions', items: [
            { s: `SYSDATE — Current date and time\nADD_MONTHS(date, n) — Add n months` },
            { s: `MONTHS_BETWEEN(d1, d2) — Months diff\nNEXT_DAY(date, day) — Next weekday\nLAST_DAY(date) — Last day of month` },
            { s: `NEW_TIME(date, z1, z2) — Convert timezone` },
            { s: `TO_CHAR(val, fmt) — Convert to string\nTO_DATE(str, fmt) — Convert to date\nNVL(x, y) — If x is null, return y` },
        ]
    },
    {
        title: 'Constraints Reference', items: [
            { s: `NOT NULL   — column cannot hold NULL\nDEFAULT 0  — value if none given\nUNIQUE     — no duplicate values\nPRIMARY KEY — unique + not null (only one/table)\nFOREIGN KEY — references another table's PK\nCHECK (cond) — custom condition on values` },
        ]
    },
];
