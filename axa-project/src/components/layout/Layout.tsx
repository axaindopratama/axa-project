import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';
import { useState, useEffect } from 'react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 z-50">
          <Sidebar />
        </div>
      )}
      
      <div className={isMobile ? '' : 'ml-64'}>
        <TopAppBar onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}