import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import * as api from '@/lib/api';

interface Entity {
  id: string;
  name: string;
  type: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export function Vendors() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'vendor' | 'client'>('all');
  const [entityStats, setEntityStats] = useState<Record<string, { totalSpent: number; totalUnpaid: number; transactionCount: number }>>({});

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      const data = await api.getEntities(filter === 'all' ? undefined : filter);
      setEntities(data);
      
      // Load stats for each entity
      const stats: Record<string, { totalSpent: number; totalUnpaid: number; transactionCount: number }> = {};
      for (const entity of data) {
        const entityStats = await api.getEntitySpendingStats(entity.id);
        stats[entity.id] = {
          totalSpent: entityStats.totalSpent,
          totalUnpaid: entityStats.totalUnpaid,
          transactionCount: entityStats.transactionCount,
        };
      }
      setEntityStats(stats);
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalUnpaid = Object.values(entityStats).reduce((sum, s) => sum + s.totalUnpaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Vendor & Klien</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola kontak dan tagihan</p>
        </div>
        <Link
          to="/vendors/new"
          className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Tambah Vendor/Klien
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Vendor</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {entities.filter(e => e.type === 'vendor').length}
          </p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Klien</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {entities.filter(e => e.type === 'client').length}
          </p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Hutang Belum Lunas</p>
          <p className="text-2xl font-headline font-bold text-error mt-1">{formatCurrency(totalUnpaid)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/15">
        {(['all', 'vendor', 'client'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 text-sm font-label font-medium border-b-2 transition-colors ${
              filter === f
                ? 'text-primary border-primary'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'vendor' ? 'Vendor' : 'Klien'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm mt-4">Memuat...</p>
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-low rounded-lg">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-medium text-on-surface">Belum ada data</h3>
          <p className="text-zinc-500 text-sm mt-2">Tambahkan vendor atau klien pertama Anda</p>
          <Link
            to="/vendors/new"
            className="inline-block mt-4 gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + Tambah Vendor/Klien
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entities.map((entity) => {
            const stats = entityStats[entity.id] || { totalSpent: 0, totalUnpaid: 0, transactionCount: 0 };
            return (
              <Link
                key={entity.id}
                to={`/vendors/${entity.id}`}
                className="block bg-surface-container-low p-4 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      entity.type === 'vendor' ? 'bg-primary/10' : 'bg-tertiary/10'
                    }`}>
                      <svg className={`w-6 h-6 ${entity.type === 'vendor' ? 'text-primary' : 'text-tertiary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {entity.type === 'vendor' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-on-surface font-label font-semibold">{entity.name}</h3>
                      <p className="text-xs text-zinc-500 capitalize">{entity.type}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {entity.type === 'vendor' && stats.totalUnpaid > 0 && (
                      <p className="text-sm text-error font-label">{formatCurrency(stats.totalUnpaid)} belum lunas</p>
                    )}
                    <p className="text-sm text-zinc-400 font-label">
                      {stats.transactionCount} transaksi • {formatCurrency(stats.totalSpent)} total
                    </p>
                  </div>
                </div>
                
                {(entity.email || entity.phone) && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/15 flex gap-4 text-sm text-zinc-500">
                    {entity.email && <span>{entity.email}</span>}
                    {entity.phone && <span>{entity.phone}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}