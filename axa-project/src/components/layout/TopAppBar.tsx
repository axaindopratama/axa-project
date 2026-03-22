import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Proyek',
  '/projects/new': 'Proyek Baru',
  '/keuangan': 'Keuangan',
  '/keuangan/arus-kas': 'Arus Kas',
  '/kanban': 'Financial Kanban',
  '/scanner': 'AI Scanner',
  '/vendors': 'Vendor & Klien',
  '/settings': 'Pengaturan',
};

export function TopAppBar() {
  const location = useLocation();
  
  const getTitle = () => {
    // Check exact match first
    if (routeTitles[location.pathname]) {
      return routeTitles[location.pathname];
    }
    // Check for dynamic routes
    for (const [path, title] of Object.entries(routeTitles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return title;
      }
    }
    return 'AXA Project';
  };

  return (
    <header className="flex justify-between items-center w-full px-8 h-16 bg-surface sticky top-0 z-40 font-headline">
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-low px-4 py-2 flex items-center gap-3 rounded border border-outline-variant/10">
          <span className="text-zinc-500 text-sm">{getTitle()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari..."
            className="bg-surface-container-highest px-4 py-2 pl-10 rounded border border-outline-variant/15 text-sm text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary/40 transition-colors w-64"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Notifications */}
        <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-surface-container-highest rounded transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        {/* User Avatar */}
        <button className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold text-sm">
          A
        </button>
      </div>
    </header>
  );
}