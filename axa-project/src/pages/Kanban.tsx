import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import * as api from '@/lib/api';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  hours: number | null;
}

interface Project {
  id: string;
  number: string;
  name: string;
  budget: number;
  hourlyRate: number | null;
}

export function Kanban() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    estimatedCost: '',
    actualCost: '',
    hours: '',
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-zinc-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-tertiary' },
    { id: 'done', title: 'Done', color: 'bg-primary' },
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  async function loadTasks() {
    if (!selectedProject) return;
    try {
      const data = await api.getTasksByProject(selectedProject);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If moving to done, open modal to capture actual cost
    if (newStatus === 'done' && task.status !== 'done') {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        estimatedCost: task.estimatedCost?.toString() || '',
        actualCost: task.actualCost?.toString() || '',
        hours: task.hours?.toString() || '',
      });
      setShowTaskModal(true);
      return;
    }

    // Otherwise just update status
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async function handleSaveTask() {
    if (!editingTask) return;

    const project = projects.find(p => p.id === selectedProject);
    const hourlyRate = project?.hourlyRate || 0;
    const laborCost = parseFloat(taskForm.hours || '0') * hourlyRate;
    const actualCost = parseFloat(taskForm.actualCost || '0') + laborCost;

    try {
      await api.updateTask(editingTask.id, {
        title: taskForm.title,
        description: taskForm.description || null,
        estimatedCost: parseFloat(taskForm.estimatedCost) || 0,
        actualCost,
        hours: parseFloat(taskForm.hours) || 0,
        status: 'done',
      });
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  }

  async function handleCreateTask() {
    if (!selectedProject || !taskForm.title) return;

    try {
      await api.createTask({
        projectId: selectedProject,
        title: taskForm.title,
        description: taskForm.description || undefined,
        estimatedCost: parseFloat(taskForm.estimatedCost) || 0,
      });
      setTaskForm({ title: '', description: '', estimatedCost: '', actualCost: '', hours: '' });
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalActual = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const budgetRemaining = (selectedProjectData?.budget || 0) - totalActual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Financial Kanban</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola tugas dengan tracking biaya</p>
        </div>
        
        {/* Project Selector */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
        >
          <option value="">Pilih Proyek...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {selectedProject && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Budget</p>
            <p className="text-lg font-headline font-bold text-primary">{formatCurrency(selectedProjectData?.budget || 0)}</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Estimated</p>
            <p className="text-lg font-headline font-bold text-on-surface">{formatCurrency(totalEstimated)}</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Actual</p>
            <p className="text-lg font-headline font-bold text-on-surface">{formatCurrency(totalActual)}</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Sisa</p>
            <p className={`text-lg font-headline font-bold ${budgetRemaining >= 0 ? 'text-tertiary' : 'text-error'}`}>
              {formatCurrency(budgetRemaining)}
            </p>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {selectedProject ? (
        <div className="grid grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="bg-surface-container-low p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-headline font-semibold text-on-surface">{column.title}</h3>
                </div>
                <span className="text-xs text-zinc-500">{getTasksByStatus(column.id).length}</span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    className="bg-surface-container-high p-4 rounded-lg cursor-move hover:bg-surface-container-highest transition-colors"
                  >
                    <h4 className="text-on-surface font-label font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/15">
                      <div>
                        <p className="text-xs text-zinc-500">Estimasi</p>
                        <p className="text-sm font-label text-zinc-400">{formatCurrency(task.estimatedCost || 0)}</p>
                      </div>
                      {task.actualCost !== null && task.actualCost > 0 && (
                        <div>
                          <p className="text-xs text-zinc-500">Actual</p>
                          <p className="text-sm font-label text-primary">{formatCurrency(task.actualCost)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData('taskId');
                    if (taskId) handleStatusChange(taskId, column.id);
                  }}
                  className="border-2 border-dashed border-outline-variant/15 rounded-lg p-4 min-h-[80px] flex items-center justify-center text-zinc-500 text-sm"
                >
                  {column.id === 'todo' && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setTaskForm({ title: '', description: '', estimatedCost: '', actualCost: '', hours: '' });
                        setShowTaskModal(true);
                      }}
                      className="text-primary hover:text-primary-dim"
                    >
                      + Tambah Tugas
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-container-low rounded-lg">
          <p className="text-zinc-500">Pilih proyek terlebih dahulu</p>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-low p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">
              {editingTask ? 'Selesai Tugas' : 'Tambah Tugas'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Judul</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                  placeholder="Nama tugas..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Deskripsi</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Estimasi Biaya (IDR)</label>
                <input
                  type="number"
                  value={taskForm.estimatedCost}
                  onChange={(e) => setTaskForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                  placeholder="0"
                />
              </div>

              {editingTask && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Jam Kerja</label>
                    <input
                      type="number"
                      value={taskForm.hours}
                      onChange={(e) => setTaskForm(p => ({ ...p, hours: e.target.value }))}
                      className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Biaya Aktual (IDR)</label>
                    <input
                      type="number"
                      value={taskForm.actualCost}
                      onChange={(e) => setTaskForm(p => ({ ...p, actualCost: e.target.value }))}
                      className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTask ? handleSaveTask : handleCreateTask}
                className="gold-gradient px-6 py-2 rounded-lg text-on-primary font-label font-medium"
              >
                {editingTask ? 'Selesai' : 'Simpan'}
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="bg-surface-container-highest px-6 py-2 rounded-lg text-zinc-400 font-label"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}