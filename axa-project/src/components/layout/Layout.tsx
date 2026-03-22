import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64">
        <TopAppBar />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}