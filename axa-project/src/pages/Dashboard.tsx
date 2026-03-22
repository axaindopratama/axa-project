import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils';
import * as api from '@/lib/api';

interface Project {
  id: string;
  number: string;
  name: string;
  budget: number;
  status: string;
  startDate: string | null;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalSpent: number;
  accountsPayable: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    accountsPayable: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, projects] = await Promise.all([
        api.getProjectStats(),
        api.getProjects(),
      ]);
      
      setStats(statsData);
      setRecentProjects(projects.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = stats.totalProjects > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Ringkasan proyek dan keuangan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-label">Total Proyek</p>
              <p className="text-3xl font-headline font-bold text-primary mt-2">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-label">Proyek Aktif</p>
              <p className="text-3xl font-headline font-bold text-on-surface mt-2">{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-label">Total Budget</p>
              <p className="text-2xl font-headline font-bold text-primary mt-2">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-label">Accounts Payable</p>
              <p className="text-2xl font-headline font-bold text-error mt-2">{formatCurrency(stats.accountsPayable)}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-low p-6 rounded-lg">
        <h2 className="text-lg font-headline font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            to="/projects/new"
            className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + Proyek Baru
          </Link>
          <Link
            to="/scanner"
            className="bg-surface-container-highest px-6 py-3 rounded-lg text-on-surface font-label font-medium text-sm border border-outline-variant/15 hover:bg-surface-container-high transition-colors"
          >
            Scan Nota
          </Link>
          <Link
            to="/vendors/new"
            className="bg-surface-container-highest px-6 py-3 rounded-lg text-on-surface font-label font-medium text-sm border border-outline-variant/15 hover:bg-surface-container-high transition-colors"
          >
            Tambah Vendor
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      {hasData ? (
        <div className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-headline font-semibold text-on-surface">Proyek Terbaru</h2>
            <Link to="/projects" className="text-primary hover:text-primary-dim text-sm font-label">
              Lihat Semua →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-label text-zinc-500 uppercase tracking-widest">#{project.number}</span>
                  <span className="text-on-surface font-label">{project.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-label ${
                    project.status === 'active' ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/20 text-primary'
                  }`}>
                    {project.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                  <span className="text-primary font-headline font-semibold">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-surface-container-low rounded-lg">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-medium text-on-surface">Belum ada proyek</h3>
          <p className="text-zinc-500 text-sm mt-2">Mulai dengan membuat proyek pertama Anda</p>
          <Link
            to="/projects/new"
            className="inline-block mt-4 gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + Proyek Baru
          </Link>
        </div>
      )}
    </div>
  );
}