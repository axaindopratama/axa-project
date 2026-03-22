import { useState } from 'react';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'system'>('profile');
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@axa-project.com',
    phone: '+62812345678',
  });

  const [defaultSettings, setDefaultSettings] = useState({
    hourlyRate: '100000',
    currency: 'IDR',
    dateFormat: 'DD/MM/YYYY',
  });

  const handleSaveProfile = () => {
    alert('Profil disimpan!');
  };

  const handleSaveDefaults = () => {
    alert('Pengaturan default disimpan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Pengaturan</h1>
        <p className="text-zinc-500 text-sm mt-1">Kelola profil dan konfigurasi sistem</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/15">
        {([
          { id: 'profile', label: 'Profil' },
          { id: 'projects', label: 'Default Proyek' },
          { id: 'system', label: 'Sistem' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-label font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-surface-container-low p-6 rounded-lg max-w-2xl">
          <h3 className="font-headline font-semibold text-on-surface mb-6">Informasi Profil</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-on-primary text-2xl font-headline font-bold">
                {profile.name.charAt(0)}
              </div>
              <div>
                <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-on-surface text-sm font-label border border-outline-variant/15 hover:bg-surface-container-high transition-colors">
                  Ganti Foto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Nomor Telepon</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium hover:opacity-90 transition-opacity"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Defaults Tab */}
      {activeTab === 'projects' && (
        <div className="bg-surface-container-low p-6 rounded-lg max-w-2xl">
          <h3 className="font-headline font-semibold text-on-surface mb-6">Pengaturan Default Proyek</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Hourly Rate Default (IDR)</label>
                <input
                  type="number"
                  value={defaultSettings.hourlyRate}
                  onChange={(e) => setDefaultSettings(s => ({ ...s, hourlyRate: e.target.value }))}
                  className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
                />
                <p className="text-xs text-zinc-500 mt-1">Rate default untuk menghitung biaya tenaga kerja</p>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Mata Uang</label>
                <select
                  value={defaultSettings.currency}
                  onChange={(e) => setDefaultSettings(s => ({ ...s, currency: e.target.value }))}
                  className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
                >
                  <option value="IDR">IDR - Rupiah Indonesia</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Format Tanggal</label>
              <select
                value={defaultSettings.dateFormat}
                onChange={(e) => setDefaultSettings(s => ({ ...s, dateFormat: e.target.value }))}
                className="w-full bg-surface-container-highest px-4 py-3 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveDefaults}
                className="gold-gradient px-6 py-3 rounded-lg text-on-primary font-label font-medium hover:opacity-90 transition-opacity"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="bg-surface-container-low p-6 rounded-lg max-w-2xl">
          <h3 className="font-headline font-semibold text-on-surface mb-6">Informasi Sistem</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-container-high rounded-lg">
              <div>
                <p className="text-on-surface font-label">Versi Aplikasi</p>
                <p className="text-xs text-zinc-500">AXA Project v1.0</p>
              </div>
              <span className="text-primary font-label">The Sovereign Ledger</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-surface-container-high rounded-lg">
              <div>
                <p className="text-on-surface font-label">Database</p>
                <p className="text-xs text-zinc-500">Turso (LibSQL)</p>
              </div>
              <span className="text-tertiary font-label">Connected</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-surface-container-high rounded-lg">
              <div>
                <p className="text-on-surface font-label">AI Integration</p>
                <p className="text-xs text-zinc-500">OpenRouter API</p>
              </div>
              <span className="text-tertiary font-label">Active</span>
            </div>

            <div className="pt-6 border-t border-outline-variant/15">
              <h4 className="text-sm font-label text-zinc-400 mb-3">API Keys Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">OpenRouter API</span>
                  <span className="text-tertiary">✓ Configured</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Turso Database</span>
                  <span className="text-tertiary">✓ Connected</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Better Auth</span>
                  <span className="text-tertiary">✓ Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}