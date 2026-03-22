import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  updatedAt: string | null;
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  percentage: number;
  isPaid: boolean | null;
  dueDate: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  estimatedCost: number | null;
  actualCost: number | null;
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', amount: '', percentage: '' });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      const [projectData, milestonesData, tasksData] = await Promise.all([
        api.getProjectById(id),
        api.getMilestonesByProject(id),
        api.getTasksByProject(id),
      ]);
      setProject(projectData);
      setMilestones(milestonesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !milestoneForm.title || !milestoneForm.amount) return;
    
    try {
      await api.createMilestone({
        projectId: id,
        title: milestoneForm.title,
        amount: parseFloat(milestoneForm.amount),
        percentage: parseFloat(milestoneForm.percentage) || 0,
      });
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', amount: '', percentage: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  }

  async function handleToggleMilestone(milestone: Milestone) {
    try {
      await api.updateMilestone(milestone.id, { isPaid: !milestone.isPaid });
      loadData();
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  }

  async function handleDeleteProject() {
    if (!id || !confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;
    
    try {
      await api.deleteProject(id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  // Calculate stats
  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const paidMilestoneAmount = milestones.filter(m => m.isPaid === true).reduce((sum, m) => sum + m.amount, 0);
  const totalTaskEstimated = tasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalTaskActual = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
  const budgetRemaining = (project?.budget || 0) - totalTaskActual;
  const budgetUsedPercent = project ? ((totalTaskActual / project.budget) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Proyek tidak ditemukan</p>
        <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
          Kembali ke Proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-label">Kembali ke Proyek</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-label text-zinc-500 uppercase tracking-widest">#{project.number}</span>
            <h1 className="text-2xl font-headline font-bold text-on-surface">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-label font-medium ${
              project.status === 'active' ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/20 text-primary'
            }`}>
              {project.status === 'active' ? 'Aktif' : 'Selesai'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/edit`}
            className="bg-surface-container-highest px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteProject}
            className="bg-surface-container-highest px-4 py-2 rounded-lg text-error hover:bg-error/20 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Budget</p>
          <p className="text-xl font-headline font-bold text-primary mt-1">{formatCurrency(project.budget)}</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Terpakai</p>
          <p className="text-xl font-headline font-bold text-on-surface mt-1">{formatCurrency(totalTaskActual)}</p>
          <p className="text-xs text-zinc-500 mt-1">{budgetUsedPercent}% dari budget</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Sisa Budget</p>
          <p className={`text-xl font-headline font-bold mt-1 ${budgetRemaining >= 0 ? 'text-tertiary' : 'text-error'}`}>
            {formatCurrency(budgetRemaining)}
          </p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Milestone</p>
          <p className="text-xl font-headline font-bold text-on-surface mt-1">
            {formatCurrency(paidMilestoneAmount)} / {formatCurrency(totalMilestoneAmount)}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-surface-container-low p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-400">Budget Usage</span>
          <span className="text-sm text-zinc-400">{budgetUsedPercent}%</span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              parseFloat(budgetUsedPercent) >= 80 ? 'bg-error' : parseFloat(budgetUsedPercent) >= 60 ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(parseFloat(budgetUsedPercent), 100)}%` }}
          />
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-surface-container-low p-4 rounded-lg">
          <h3 className="text-sm font-label text-zinc-500 uppercase tracking-widest mb-2">Deskripsi</h3>
          <p className="text-on-surface">{project.description}</p>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-surface-container-low p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-headline font-semibold text-on-surface">Milestone Pembayaran</h3>
          <button
            onClick={() => setShowMilestoneForm(!showMilestoneForm)}
            className="text-primary hover:text-primary-dim text-sm font-label"
          >
            + Tambah
          </button>
        </div>
        
        {showMilestoneForm && (
          <form onSubmit={handleAddMilestone} className="mb-6 p-4 bg-surface-container-high rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nama</label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: DP 30%"
                  className="w-full bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Jumlah (IDR)</label>
                <input
                  type="number"
                  value={milestoneForm.amount}
                  onChange={(e) => setMilestoneForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Persentase (%)</label>
                <input
                  type="number"
                  value={milestoneForm.percentage}
                  onChange={(e) => setMilestoneForm(p => ({ ...p, percentage: e.target.value }))}
                  placeholder="30"
                  className="w-full bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="gold-gradient px-4 py-2 rounded text-on-primary text-xs font-label">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowMilestoneForm(false)}
                className="bg-surface-container-highest px-4 py-2 rounded text-zinc-400 text-xs font-label"
              >
                Batal
              </button>
            </div>
          </form>
        )}
        
        {milestones.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">Belum ada milestone</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleMilestone(milestone)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      milestone.isPaid === true ? 'bg-primary border-primary' : 'border-zinc-500 hover:border-primary'
                    }`}
                  >
                    {milestone.isPaid && (
                      <svg className="w-3 h-3 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className="text-on-surface font-label">{milestone.title}</p>
                    <p className="text-xs text-zinc-500">{milestone.percentage}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-headline font-semibold ${milestone.isPaid ? 'text-primary' : 'text-on-surface'}`}>
                    {formatCurrency(milestone.amount)}
                  </p>
                  {milestone.dueDate && (
                    <p className="text-xs text-zinc-500">{formatDate(milestone.dueDate)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Preview */}
      <div className="bg-surface-container-low p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-headline font-semibold text-on-surface">Tugas</h3>
          <Link to={`/kanban?project=${id}`} className="text-primary hover:text-primary-dim text-sm font-label">
            Lihat Kanban →
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">Belum ada tugas</p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    task.status === 'done' ? 'bg-primary' : task.status === 'in_progress' ? 'bg-tertiary' : 'bg-zinc-500'
                  }`} />
                  <span className="text-on-surface text-sm">{task.title}</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {formatCurrency((task.actualCost ?? task.estimatedCost) || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}