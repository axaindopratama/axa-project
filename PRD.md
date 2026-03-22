Ini adalah Project Requirements Document (PRD) final yang sangat komprehensif untuk AXA Project. Dokumen ini telah menggabungkan seluruh fitur cerdas, integrasi AI, dan spesifikasi teknis yang kita diskusikan.
Dokumen ini dirancang sebagai panduan tunggal (single source of truth) yang bisa Anda berikan langsung kepada OpenCode CLI.
PRD — Project Requirements Document: AXA Project
1. Project Overview
AXA Project adalah aplikasi web manajemen proyek dan keuangan yang dirancang untuk sinkronisasi total antara progres fisik tugas dengan kesehatan finansial. Aplikasi ini mengotomatiskan pencatatan biaya melalui AI Vision dan memberikan wawasan prediktif terhadap sisa anggaran di setiap proyek.
 * Nama Aplikasi: AXA Project
 * Identitas Proyek: Penomoran otomatis menggunakan format 3 digit (contoh: 001, 002, 003).
 * Tujuan Utama: Menghilangkan kebocoran anggaran melalui pelacakan biaya granular dan otomatisasi input data.
2. Technical Stack
 * Frontend & API: Vite + React.js (Arsitektur Full-stack dalam satu repositori).
 * Backend & ORM: Drizzle ORM.
 * Database: SQLite (Lokal untuk dev) & Turso (LibSQL) untuk persistensi di cloud/Vercel.
 * Authentication: Better Auth (Adapter SQLite).
 * Styling: Tailwind CSS + Shadcn/UI (Dark Mode default).
 * AI Integration: OpenRouter API (Multimodal/Vision & Chat).
 * Environment: Termux (Proot-Distro Debian) + GitHub + Vercel.
3. Core Features & Detailed Logic
3.1 Project & Milestone Management
 * Dynamic Dashboard: Ringkasan proyek aktif, total saldo, dan status keuntungan (real-time profitability).
 * Milestone-Based Billing: Pembayaran termin yang terikat pada progres (Contoh: DP 30%, Termin I 40%, Pelunasan 30%).
 * 3-Digit Numbering: Setiap proyek baru otomatis mendapatkan nomor urut (XXX).
3.2 Financial Kanban (Task-to-Cost)
 * Setiap kartu tugas memiliki metadata: estimated_cost dan actual_cost.
 * Done-Trigger: Saat tugas dipindah ke kolom "Done", sistem memunculkan modal untuk input biaya aktual dan jam kerja.
 * Time-to-Value: Menghitung biaya tenaga kerja berdasarkan hourly rate yang ditentukan di level proyek.
3.3 AI Receipt Scanner (Vision OCR)
 * Automated Logging: User mengunggah foto nota/invoice.
 * AI Extraction: Menggunakan Vision AI untuk mengekstrak Vendor, Tanggal, Nama Barang, Qty, dan Harga Satuan.
 * Verification Flow: User memverifikasi hasil ekstraksi sebelum data disimpan ke tabel transaksi dan memotong anggaran proyek secara otomatis.
3.4 Smart Budget Forecasting
 * Burn Rate Indicator: Menghitung rata-rata pengeluaran harian untuk memprediksi tanggal anggaran akan habis.
 * Threshold Alerts: Progress bar dinamis (Kuning di 60%, Merah/Peringatan di 80% penggunaan anggaran).
3.5 Vendor & Client Directory
 * Spending Profile: Track vendor mana yang paling sering digunakan dan total biaya yang telah dibayarkan kepada mereka.
 * Payment Status: Melacak tagihan vendor yang belum lunas (Accounts Payable).
3.6 AI-Powered Insights
 * Natural Language Search: Cari data via teks (Contoh: "Berapa total belanja semen di Proyek 002 bulan lalu?").
 * Anomaly Detection: AI mendeteksi jika ada pengeluaran tugas yang melebihi 20% dari estimasi awal secara otomatis.
4. Database Schema (Drizzle Specifications)
| Tabel | Kolom Utama | Relasi |
|---|---|---|
| users | id, email, name, password | Auth (Better Auth) |
| projects | id, number (XXX), name, budget, status, start/end_date | One-to-Many: Milestones, Tasks |
| milestones | id, projectId, title, amount, percentage, is_paid | Belongs to: Projects |
| tasks | id, projectId, title, status, est_cost, act_cost, hours | Belongs to: Projects |
| entities | id, name, type (Vendor/Client), contact | One-to-Many: Transactions |
| transactions | id, projectId, entityId, amount, type, receipt_url | Belongs to: Projects, Entities |
| transaction_items | id, transactionId, desc, qty, price | Detail item dari hasil scan nota AI |
5. Development Roadmap (Agent Instruction)
Phase 1: Environment & Base Setup
 * Setup Vite-React dan install: drizzle-orm, @libsql/client, better-auth, tailwind-merge, shadcn-ui.
 * Konfigurasi Drizzle untuk mendukung SQLite lokal dan Turso Cloud.
Phase 2: Auth & Database Migration
 * Definisikan schema.ts secara lengkap berdasarkan Poin 4.
 * Implementasi Better Auth. Jalankan migrasi ke Turso.
Phase 3: Core CRUD & UI
 * Buat Layout (Sidebar/Navbar) dan Dashboard.
 * Implementasi logika penomoran proyek (XXX).
 * Buat modul manajemen Vendor dan Klien.
Phase 4: AI Receipt Scanner Integration
 * Implementasi upload gambar ke storage (Vercel Blob/Uploadcare).
 * Koneksi ke OpenRouter (Vision) untuk parsing data nota ke format JSON.
 * Buat UI review hasil scan nota.
Phase 5: Kanban & Financial Logic
 * Membangun Kanban board dengan cost tracking.
 * Implementasi algoritma Burn Rate dan Profitability.
Phase 6: AI Insights & Search
 * Integrasi fitur pencarian berbasis bahasa alami menggunakan konteks data dari SQLite.
6. UX/UI Guidelines
 * Clean & Modern: Gunakan palet warna Slate/Zinc dari Shadcn.
 * Mobile Optimized: Karena dikembangkan di Termux, UI harus nyaman diakses via layar ponsel.
 * Informative: Gunakan banyak visualisasi data (grafik garis untuk pengeluaran, progress bar untuk budget).
