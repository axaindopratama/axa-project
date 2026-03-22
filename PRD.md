PRD — Project Requirements Document: AXA Project (Final Revision)
1. Overview
AXA Project adalah aplikasi manajemen proyek dan keuangan terpadu yang dirancang untuk memantau kesehatan finansial setiap proyek secara real-time. Fokus utama aplikasi ini adalah sinkronisasi antara progres fisik (tugas) dengan arus kas (anggaran vs realisasi), dilengkapi dengan analisis prediksi cerdas.
2. Requirements
2.1 Functional Requirements
 * Secure Auth: Autentikasi menggunakan Better Auth dengan adapter SQLite.
 * Project Central: Manajemen siklus hidup proyek (Inisiasi, Aktif, Selesai).
 * Financial Tracking: Pencatatan pemasukan (termin) dan pengeluaran secara granular.
 * Predictive Engine: Menghitung sisa waktu dana berdasarkan kecepatan pengeluaran.
 * Master Data: Manajemen direktori Vendor dan Klien yang terpusat.
2.2 Non-Functional Requirements
 * Resource Efficient: Performa ringan untuk dijalankan di lingkungan Termux (Debian Proot).
 * Edge-Ready: Database menggunakan Turso (LibSQL) untuk persistensi data di Vercel.
 * Type Safety: Integritas skema database dijamin 100% oleh Drizzle ORM.
 * Offline-First Friendly: Pengembangan lokal di Termux menggunakan file SQLite lokal sebelum sinkronisasi ke cloud Turso.
3. Core Features (Detailed)
3.1 Smart Budget Forecasting
 * Burn Rate Indicator: Algoritma pemantau pengeluaran harian/mingguan untuk memprediksi tanggal "Zero Balance".
 * Threshold Alerts: Indikator visual dinamis (Merah jika pengeluaran > 80% anggaran).
3.2 Milestone-Based Billing
 * Progress-to-Payment: Hubungan otomatis antara penyelesaian milestone fisik dengan jadwal penagihan (invoicing).
 * Real-time Profitability: Kalkulasi selisih dana masuk dari klien vs dana keluar ke operasional/vendor secara langsung.
3.3 Task-to-Cost Integration (Financial Kanban)
 * Metadata Biaya Tugas: Setiap kartu tugas di Kanban memiliki estimasi biaya (estimated_cost) dan biaya aktual (actual_cost).
 * Time-to-Value: Konversi otomatis jam kerja menjadi nilai moneter berdasarkan rate per jam proyek.
3.4 Vendor & Client Directory
 * Spending Profile: Laporan akumulasi dana yang dibayarkan ke setiap vendor.
 * Account Payable Tracking: Pemantauan tagihan vendor yang belum lunas (status pending payment).
3.5 AI-Powered Financial Insights
 * Natural Language Search: Kemampuan mencari transaksi melalui teks (Contoh: "Total biaya material bulan Januari").
 * Anomaly Detection: Deteksi otomatis pengeluaran yang melonjak secara tidak wajar dibandingkan estimasi awal.
4. Architecture & Tech Stack
 * Frontend: Vite + React.js (SPA).
 * Backend/API: React Server Functions atau API Routes (Vercel Functions).
 * Styling: Tailwind CSS + Shadcn/UI.
 * Database: Turso (LibSQL/SQLite).
 * ORM: Drizzle ORM.
 * Auth: Better Auth.
 * Hosting: Vercel.
 * Environment: Termux + Proot-Distro Debian.
5. Database Schema (Drizzle Logic)
| Table | Primary Columns | Key Features |
|---|---|---|
| users | id, email, name | Auth managed by Better Auth. |
| projects | id, name, total_budget, status | ID Format: (XXX) 3-digit numbering. |
| milestones | id, projectId, title, amount | Link to billing terms. |
| tasks | id, projectId, status, est_cost, act_cost | Financial Kanban integration. |
| entities | id, name, type (Vendor/Client) | Directory management. |
| transactions | id, projectId, entityId, amount, type | Ledger entry (Income/Expense). |
6. Roadmap: Development Process Flow (For AI Agent)
Fase ini dirancang khusus untuk instruksi bertahap pada OpenCode CLI:
Phase 1: Environment & Base Setup
 * Inisialisasi project Vite-React.
 * Install dependencies: drizzle-orm, @libsql/client, better-auth, tailwind-merge, lucide-react.
 * Konfigurasi Turso CLI di Debian: turso db create axa-db.
 * Setup drizzle.config.ts untuk menghubungkan file lokal SQLite dengan remote Turso.
Phase 2: Schema & Auth Initialization
 * Definisikan schema.ts lengkap berdasarkan tabel di Poin 5.
 * Gunakan Better Auth untuk membuat sistem login dengan adapter SQLite.
 * Jalankan drizzle-kit push untuk migrasi skema ke Turso.
Phase 3: Core UI Framework
 * Setup Layout utama (Sidebar & Navbar) menggunakan Shadcn/UI.
 * Implementasi Dashboard Overview dengan grafik sisa anggaran (Recharts).
 * Bangun fitur CRUD Proyek dengan penomoran otomatis (XXX).
Phase 4: Financial & Task Engine
 * Bangun Kanban Board yang terintegrasi dengan field actual_cost.
 * Buat logika Server Action untuk update saldo proyek setiap kali transaksi diinput.
 * Implementasi modul Vendor/Client Directory.
Phase 5: Predictive & AI Logic
 * Buat fungsi kalkulasi burnRate untuk fitur Smart Forecasting.
 * Integrasikan OpenRouter API melalui OpenCode CLI untuk fitur Natural Language Search pada data transaksi.
Phase 6: Final Deployment
 * Setting environment variables di Vercel (TURSO_URL, TURSO_AUTH_TOKEN).
 * Konfigurasi vercel.json untuk optimasi serverless.
 * Push ke GitHub untuk auto-deploy.
7. Additional Wildcard Idea (Discovery)
 * Multi-Currency Support: Karena proyek seringkali melibatkan vendor atau alat dari luar negeri, tambahkan fitur konversi mata uang otomatis menggunakan API kurs terkini agar pencatatan tetap akurat dalam satu mata uang utama.
Instruksi untuk OpenCode CLI: "Gunakan PRD ini sebagai panduan utama. Mulailah dengan Phase 1: Setup project Vite-React dan konfigurasi Drizzle ORM menggunakan LibSQL untuk Turso. Buatlah struktur folder yang modular (components, hooks, lib, server)."
