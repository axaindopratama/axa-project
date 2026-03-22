import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectForm } from '@/pages/ProjectForm';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Vendors } from '@/pages/Vendors';
import { EntityForm } from '@/pages/EntityForm';
import { Kanban } from '@/pages/Kanban';
import { Scanner } from '@/pages/Scanner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Projects */}
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          
          {/* Vendors */}
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/new" element={<EntityForm />} />
          <Route path="vendors/:id" element={<EntityForm />} />
          
          {/* Kanban */}
          <Route path="kanban" element={<Kanban />} />
          
          {/* Scanner */}
          <Route path="scanner" element={<Scanner />} />
          
          {/* Placeholder routes */}
          <Route path="keuangan" element={<PlaceholderPage title="Keuangan" />} />
          <Route path="scanner" element={<PlaceholderPage title="AI Scanner" />} />
          <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-headline font-medium text-on-surface">{title}</h3>
      <p className="text-zinc-500 text-sm mt-2">Halaman sedang dalam pengembangan</p>
    </div>
  );
}

export default App;