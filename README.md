# 🗄️ iSQL*Home — College Practice Edition

**iSQL*Home (QPracto)** is an advanced, browser-based Oracle SQL practice environment designed for college students. It runs a lightning-fast SQLite engine natively inside your browser via WebAssembly — requiring absolutely no backend installation — while transparently emulating complex Oracle specific syntax like `SYSDATE`, `VARCHAR2`, and native single-row functions.

Complete with a dynamic, VS-Code like typing experience, a live schema tree, and a built-in Lab Assessment tracker, this tool is the ultimate isolated sandbox for mastering database management.

---

## ✨ Core Features

- **Rich Syntax Highlighting**: Includes a beautifully integrated `react-simple-code-editor` powered by `Prism.js` for instant, colorful SQL code highlighting and an auto-expanding notepad that seamlessly scales as you type.
- **Smart Schema Browser**: A visual left-panel explorer that dynamically detects and badges Primary Keys (**PK**), Not Null constraints (**NN**), and sophisticated Foreign Key (**FK**) relationships linking straight to their parent tables.
- **Assessment Tracking System**: Togglable "Exam Mode" for the built-in Lab Q&A! Unlocks physical checkboxes and a visual progress bar that securely saves your completed assignments across page refreshes via `localStorage`.
- **Client-Side CSV Export**: Click a single button underneath any successfully returning `SELECT` query to instantly parse your data matrix into a downloadable `.csv` file using local Blob construction!
- **Zero-Crash Pagination Engine**: Easily handles massive 10,000+ row datasets. React neatly parses returning JSON payloads into chunked pages (50 rows/page) with intuitive `[< Prev]` and `[Next >]` controllers to keep the browser fast.
- **3-Way Dynamic Themes**: Built-in support for fluid layouts including Light Mode, GitHub Dark Mode, and a specialized GitHub Dimmed Mode.
- **Live System Timers**: A real-time ticking `setInterval` digital clock and breathing visual pulse animations on the active database connection to give the interface a real "Server IDE" dashboard feel.
- **Oracle SQL Emulation**: 
  - `SYSDATE` → Returns standardized string formats natively.
  - `RIGHT JOIN` / `FULL OUTER JOIN` → Rewritten dynamically using `LEFT JOIN` and `UNION ALL` fallbacks.
  - Generates structural `BEFORE UPDATE` constraints enforcing strict native Oracle error codes like `ORA-01722: invalid number`.

---

## 🔧 Tech Stack

- **Framework**: React 18 & Vite (Lightning-fast HMR and modular UI bundling)
- **Database Engine**: `sql.js` (The official SQLite port, compiled explicitly to C-based WebAssembly)
- **Editor UI**: `react-simple-code-editor` + `Prism.js`
- **Storage Layer**: `localforage` (Wrapper for native IndexedDB binary persistence) + `localStorage` (Theme / Cache)
- **Layout Management**: `react-split` (Handling drag-to-resize viewport scaling and 100dvh mobile compliance)
- **Distribution via Cloudflare CDN**: Employs `cdnjs` endpoints to distribute the demanding `sql-wasm.wasm` binary file globally off the edge grid for instantaneous execution times.

---

## 🚀 Getting Started

Since the database runs entirely via WebAssembly inside a Web Worker, there is absolutely zero backend node configuration or Docker setup required!

### Prerequisites
- Node.js installed

### Installation

1. Clone the repository and navigate inside:
   ```bash
   cd iSQL-Home
   ```
2. Install the necessary UI dependencies:
   ```bash
   npm install
   ```
3. Start the lightning-fast Vite development server:
   ```bash
   npm run dev
   ```

### 🌍 Deployment
Deploying to GitHub Pages is fully automated! Push your code to the `main` branch, and the engineered `.github/workflows/deploy.yml` GitHub Action will configure the deployment variables and build the persistent Vite payload directly to the public web.
