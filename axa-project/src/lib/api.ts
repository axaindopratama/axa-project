const API_BASE = '/api';

// ============ PROJECTS ============

export async function getProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function getProjectById(id: string) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getProjectStats() {
  const res = await fetch(`${API_BASE}/projects/stats`);
  return res.json();
}

export async function createProject(data: {
  name: string;
  description?: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  hourlyRate?: number;
}) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProject(id: string, data: any) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProject(id: string) {
  await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============ MILESTONES ============

export async function getMilestonesByProject(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/milestones`);
  return res.json();
}

export async function createMilestone(data: {
  projectId: string;
  title: string;
  amount: number;
  percentage: number;
  dueDate?: string;
}) {
  const res = await fetch(`${API_BASE}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateMilestone(id: string, data: any) {
  const res = await fetch(`${API_BASE}/milestones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMilestone(id: string) {
  // Implement if needed
}

// ============ TASKS ============

export async function getTasksByProject(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  return res.json();
}

export async function createTask(data: any) {
  // Implement if needed
  return data;
}

export async function updateTask(id: string, data: any) {
  // Implement if needed
  return data;
}

export async function deleteTask(id: string) {
  // Implement if needed
}

// ============ ENTITIES (Vendor/Client) ============

export async function getEntities(type?: 'vendor' | 'client') {
  const url = type ? `${API_BASE}/entities?type=${type}` : `${API_BASE}/entities`;
  const res = await fetch(url);
  return res.json();
}

export async function getEntityById(id: string) {
  // Implement if needed
  return null;
}

export async function createEntity(data: {
  name: string;
  type: 'vendor' | 'client';
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEntity(id: string, data: any) {
  // Implement if needed
  return data;
}

export async function deleteEntity(id: string) {
  // Implement if needed
}

export async function getEntitySpendingStats(entityId: string) {
  // Simplified - return empty stats
  return {
    transactionCount: 0,
    totalSpent: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  };
}

// ============ TRANSACTIONS ============

export async function getTransactions(projectId?: string) {
  const url = projectId ? `${API_BASE}/transactions?projectId=${projectId}` : `${API_BASE}/transactions`;
  const res = await fetch(url);
  return res.json();
}

export async function getTransactionById(id: string) {
  // Implement if needed
  return null;
}

export async function createTransaction(data: any) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTransaction(id: string, data: any) {
  // Implement if needed
  return data;
}

export async function deleteTransaction(id: string) {
  // Implement if needed
}

// ============ TRANSACTION ITEMS ============

export async function getTransactionItems(transactionId: string) {
  // Implement if needed
  return [];
}

export async function createTransactionItem(data: any) {
  // Implement if needed
}

export async function deleteTransactionItems(transactionId: string) {
  // Implement if needed
}

// ============ AI SCANS ============

export async function createAiScan(data: any) {
  // Implement if needed
}

export async function updateAiScan(id: string, data: any) {
  // Implement if needed
}

// ============ SEARCH ============

export async function searchEntities(query: string) {
  // Implement if needed
  return [];
}