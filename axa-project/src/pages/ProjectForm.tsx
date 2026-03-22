import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '@/lib/api';

interface ProjectFormData {
  name: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  hourlyRate: string;
}

const defaultData: ProjectFormData = {
  name: '',
  description: '',
  budget: '',
  startDate: '',
  endDate: '',
  hourlyRate: '',
};

export function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [formData, setFormData] = useState<ProjectFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  async function loadProject() {
    if (!id) return;
    try {
      const project = await api.getProjectById(id);
      if (project) {
        setFormData({
          name: project.name,
          description: project.description || '',
          budget: project.budget.toString(),
          startDate: project.startDate || '',
          endDate: project.endDate || '',
          hourlyRate: project.hourlyRate?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setInitialLoading(false);
    }
  }

  function validate(): boolean {
    const newErrors: Partial<ProjectFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama proyek wajib diisi';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
      };
      
      if (id) {
        await api.updateProject(id, data);
      } else {
        await api.createProject(data);
      }
      
      navigate('/projects');
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof ProjectFormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-label">Kembali ke Proyek</span>
        </button>
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          {id ? 'Edit Proyek' : 'Proyek Baru'}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {id ? 'Perbarui informasi proyek' : 'Buat proyek baru untuk memulai'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-low p-6 rounded-lg">
        {/* Name */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Nama Proyek *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Contoh: Renovasi Kantor Pusat"
            className={`w-full bg-surface-container-highest px-4 py-3 rounded-lg border ${
              errors.name ? 'border-error' : 'border-outline-variant/15'
            } text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors`}
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Deskripsi singkat tentang proyek..."
            rows={3}
            className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors resize-none"
          />
        </div>

        {/* Budget & Hourly Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Budget (IDR) *</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              placeholder="50000000"
              className={`w-full bg-surface-container-highest px-4 py-3 rounded-lg border ${
                errors.budget ? 'border-error' : 'border-outline-variant/15'
              } text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors`}
            />
            {errors.budget && <p className="text-error text-xs mt-1">{errors.budget}</p>}
          </div>
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Hourly Rate (IDR)</label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => handleChange('hourlyRate', e.target.value)}
              placeholder="100000"
              className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Tanggal Selesai</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : id ? 'Perbarui Proyek' : 'Buat Proyek'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="bg-surface-container-highest px-6 py-3 rounded-lg text-zinc-400 font-label font-medium text-sm hover:bg-surface-container-high transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}