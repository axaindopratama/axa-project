import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils';
import * as api from '@/lib/api';

interface Project {
  id: string;
  number: string;
  name: string;
  description: string | null;
  budget: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  hourlyRate: number | null;
  createdAt: string | null;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  useEffect(() => {
    loadProjects();
  }, [filter]);

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const statusColors = {
    active: 'bg-tertiary/20 text-tertiary',
    completed: 'bg-primary/20 text-primary',
    archived: 'bg-zinc-500/20 text-zinc-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Proyek</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola semua proyek Anda</p>
        </div>
        <Link
          to="/projects/new"
          className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Proyek Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-label font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : f === 'completed' ? 'Selesai' : 'Arsip'}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm mt-4">Memuat proyek...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-low rounded-lg">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-surface-container-low p-6 rounded-lg hover:bg-surface-container-high transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-label text-zinc-500 uppercase tracking-widest">
                    #{project.number}
                  </span>
                  <h3 className="text-lg font-headline font-semibold text-on-surface mt-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-label font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                  {project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Selesai' : 'Arsip'}
                </span>
              </div>
              
              {project.description && (
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{project.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
                <div>
                  <p className="text-xs text-zinc-500">Budget</p>
                  <p className="text-lg font-headline font-bold text-primary">{formatCurrency(project.budget)}</p>
                </div>
                {project.startDate && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Mulai</p>
                    <p className="text-sm text-zinc-400">{formatDate(project.startDate)}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}