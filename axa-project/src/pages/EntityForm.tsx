import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '@/lib/api';

interface EntityFormData {
  name: string;
  type: 'vendor' | 'client';
  contact: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

const defaultData: EntityFormData = {
  name: '',
  type: 'vendor',
  contact: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
};

export function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [formData, setFormData] = useState<EntityFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<EntityFormData>>({});

  useEffect(() => {
    if (id) {
      loadEntity();
    }
  }, [id]);

  async function loadEntity() {
    if (!id) return;
    try {
      // For now, since getEntityById returns null, we'll just set loading to false
      // In a full implementation, you'd fetch the entity
      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to load entity:', error);
    } finally {
      setInitialLoading(false);
    }
  }

  function validate(): boolean {
    const newErrors: Partial<EntityFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
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
        type: formData.type,
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };
      
      if (id) {
        await api.updateEntity(id, data);
      } else {
        await api.createEntity(data);
      }
      
      navigate('/vendors');
    } catch (error) {
      console.error('Failed to save entity:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof EntityFormData, value: string) {
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
          onClick={() => navigate('/vendors')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-label">Kembali ke Vendor/Klien</span>
        </button>
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          {id ? 'Edit' : 'Tambah'} Vendor/Klien
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {id ? 'Perbarui informasi kontak' : 'Tambahkan vendor atau klien baru'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-low p-6 rounded-lg">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Tipe *</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('type', 'vendor')}
              className={`flex-1 p-4 rounded-lg border transition-colors ${
                formData.type === 'vendor'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface-container-high border-outline-variant/15 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm font-label">Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'client')}
              className={`flex-1 p-4 rounded-lg border transition-colors ${
                formData.type === 'client'
                  ? 'bg-tertiary/10 border-tertiary text-tertiary'
                  : 'bg-surface-container-high border-outline-variant/15 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-label">Klien</span>
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Nama *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Contoh: PT Sumber Jaya"
            className={`w-full bg-surface-container-highest px-4 py-3 rounded-lg border ${
              errors.name ? 'border-error' : 'border-outline-variant/15'
            } text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors`}
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Contact Person</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            placeholder="Nama kontak"
            className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-label text-zinc-400 mb-2">Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+62812345678"
              className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Alamat</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Alamat lengkap..."
            rows={2}
            className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-label text-zinc-400 mb-2">Catatan</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Catatan tambahan..."
            rows={2}
            className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : id ? 'Perbarui' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="bg-surface-container-highest px-6 py-3 rounded-lg text-zinc-400 font-label font-medium text-sm hover:bg-surface-container-high transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}