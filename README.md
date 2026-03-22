# 🗄️ iSQL*Home — College Practice Edition

**iSQL*Home** is a browser-based Oracle SQL practice environment built for college students using React and WebAssembly. It runs a full SQLite engine directly in the browser — no backend, no installation — while transparently emulating Oracle-specific syntax like `SYSDATE`, `VARCHAR2`, and 15+ Oracle-native functions. 

The app features a multi-tab SQL workspace, a live schema browser, built-in lab question sets covering DDL/DML, single-row functions, subqueries, and joins, along with a syntax reference guide and query history panel. It supports dark mode, resizable panels on desktop, and a mobile-friendly bottom-navigation layout for phones — all styled to feel like a premium Oracle SQL*Plus IDE running entirely offline in the browser.

---

## ✨ Features

- **Oracle SQL Emulation**: Runs SQLite under the hood but automatically translates Oracle syntax:
  - `SYSDATE` → returns `DD-MON-YYYY` format.
  - `RIGHT JOIN` → rewritten automatically as `LEFT JOIN`.
  - `FULL OUTER JOIN` → rewritten automatically using `UNION ALL`.
- **15+ Native Oracle Functions**: Transparently polyfilled directly into the SQLite WASM engine seamlessly (`INITCAP`, `LPAD`, `RPAD`, `MONTHS_BETWEEN`, `NEXT_DAY`, `LAST_DAY`, `NEW_TIME`, `TRUNC`, `TO_CHAR`, `TO_DATE`, `TO_NUMBER`, `NVL`, `ADD_MONTHS`).
- **4 Built-in Lab Problem Sets**: Pre-loaded schema generation and structured questions/answers for `SQL2` (DDL/DML), `SQL3` (Single-row functions), `Subqueries`, and [Joins](cci:1://file:///c:/Users/LOQ/Desktop/iSQL/isql-react/src/App.jsx:294:2-304:4).
- **Multi-Tab Workspace**: Write and execute multiple queries simultaneously.
- **Dark Mode**: Fully styled dark mode theme toggle.
- **Fully Responsive**: Drag-to-resize split panels on Desktop, and a dedicated mobile bottom-navigation layout with single-pane switching for phones.

---

## 🔧 Tech Stack

- **Framework**: React 18 & Vite
- **Database Engine**: `sql.js` (SQLite compiled to WebAssembly)
- **Styling**: Vanilla CSS (CSS Variables)
- **Layout Management**: `react-split` for Draggable Desktop panes

---

## 🚀 Getting Started

Since the database runs entirely in WebAssembly in the browser, there is zero backend setup required.

### Prerequisites
- Node.js installed

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd isql-react
