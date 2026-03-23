# 🗄️ iSQL*Home — College Practice Edition

**iSQL*Home** is a browser-based Oracle SQL practice environment built for college students using React and WebAssembly. It runs a full SQLite engine natively in the browser — no backend, no installation — while transparently emulating Oracle-specific syntax like `SYSDATE`, `VARCHAR2`, and 15+ Oracle-native functions. 

The app features a multi-tab SQL workspace, a live schema browser, built-in lab question sets covering DDL/DML, single-row functions, subqueries, and joins, along with a syntax reference guide and query history panel. 

---

## ✨ Features

- **Oracle SQL Emulation**: Runs SQLite under the hood but automatically translates Oracle syntax:
  - `SYSDATE` → returns `DD-MON-YYYY` format.
  - `RIGHT JOIN` → rewritten automatically as `LEFT JOIN`.
  - `FULL OUTER JOIN` → rewritten automatically using `UNION ALL`.
- **15+ Native Oracle Functions**: Transparently polyfilled directly into the SQLite WASM engine (`INITCAP`, `LPAD`, `RPAD`, `MONTHS_BETWEEN`, `NEXT_DAY`, `LAST_DAY`, `TRUNC`, `TO_CHAR`, `TO_DATE`, `TO_NUMBER`, `NVL`, `ADD_MONTHS`).
- **Strict Typing (`ORA-01722`)**: Relies on dynamic generation of `BEFORE INSERT` and `BEFORE UPDATE` database triggers to force strict data typing, halting bad inputs gracefully like a real Oracle server.
- **Zero-Freeze Background Execution**: The entire database engine computes queries on an asynchronous **Web Worker**, ensuring the frontend UI never locks up during massive analytical `CROSS JOIN` calculations.
- **Limitless Offline Persistence**: Replaces normal 5MB LocalStorage with **IndexedDB** (`localforage`), permanently saving massive binary database arrays natively in your browser.
- **Multi-Tab Workspace**: Write and execute multiple queries simultaneously.
- **Fully Responsive**: Drag-to-resize split panels on Desktop, and a dedicated tabbed navigation layout for Mobile.

---

## 🔧 Tech Stack

- **Framework**: React 18 & Vite (Lightning-fast HMR and modular bundling)
- **Database Engine**: `sql.js` (The official SQLite port, compiled explicitly to C-based WebAssembly)
- **Storage Layer**: `localforage` (Wrapper for native IndexedDB binary storage)
- **Styling**: Vanilla CSS Variables (For instant Light/Dark mode toggling)
- **Layout Management**: `react-split` for Draggable Desktop panes
- **Distribution via Cloudflare CDN**: Employs `cdnjs` servers to distribute the heavy `sql-wasm.wasm` binary file globally. Instead of capping bandwidth limits, the client leverages Cloudflare's edge servers for instant database loading during initialization!

---

## 🚀 Getting Started

Since the database runs entirely via WebAssembly in the browser, there is zero backend setup required!

### Prerequisites
- Node.js installed

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd iSQL-Home
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (Vite):
   ```bash
   npm run dev
   ```

### 🌍 Deployment
Deploying to GitHub Pages is fully automated! Push your code to the `main` branch, and the engineered `.github/workflows/deploy.yml` GitHub Action will automatically configure Node.js 24 environment variables and build the persistent Vite payload directly to the public web.
