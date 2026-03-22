import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Navigate to="/" replace />} />
          <Route path="keuangan" element={<Navigate to="/" replace />} />
          <Route path="kanban" element={<Navigate to="/" replace />} />
          <Route path="scanner" element={<Navigate to="/" replace />} />
          <Route path="vendors" element={<Navigate to="/" replace />} />
          <Route path="settings" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;