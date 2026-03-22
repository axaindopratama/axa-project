import { db } from './db';
import { 
  projects, 
  milestones, 
  tasks, 
  entities, 
  transactions, 
  transactionItems,
  aiScans 
} from './db/schema';
import { eq, desc, asc, sql, like, and, or } from 'drizzle-orm';

// ============ PROJECTS ============

export async function getProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: string) {
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0] || null;
}

export async function getProjectByNumber(number: string) {
  const result = await db.select().from(projects).where(eq(projects.number, number)).limit(1);
  return result[0] || null;
}

export async function getNextProjectNumber(): Promise<string> {
  const result = await db.select({ number: projects.number })
    .from(projects)
    .orderBy(desc(projects.number))
    .limit(1);
  
  if (result.length === 0) {
    return '001';
  }
  
  const currentNum = parseInt(result[0].number, 10);
  return String(currentNum + 1).padStart(3, '0');
}

export async function createProject(data: {
  name: string;
  description?: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  hourlyRate?: number;
}) {
  const number = await getNextProjectNumber();
  const id = crypto.randomUUID();
  
  await db.insert(projects).values({
    id,
    number,
    name: data.name,
    description: data.description || null,
    budget: data.budget,
    status: 'active',
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    hourlyRate: data.hourlyRate || 0,
  });
  
  return getProjectById(id);
}

export async function updateProject(id: string, data: Partial<{
  name: string;
  description: string;
  budget: number;
  status: string;
  startDate: string;
  endDate: string;
  hourlyRate: number;
}>) {
  await db.update(projects)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, id));
  
  return getProjectById(id);
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectStats() {
  const allProjects = await db.select().from(projects);
  const activeProjects = allProjects.filter(p => p.status === 'active');
  
  const totalBudget = allProjects.reduce((sum, p) => sum + p.budget, 0);
  
  // Get total spent from transactions
  const allTransactions = await db.select().from(transactions);
  const totalSpent = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get accounts payable (unpaid + partial)
  const accountsPayable = allTransactions
    .filter(t => t.paymentStatus !== 'lunas')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);
  
  return {
    totalProjects: allProjects.length,
    activeProjects: activeProjects.length,
    totalBudget,
    totalSpent,
    accountsPayable,
  };
}

// ============ MILESTONES ============

export async function getMilestonesByProject(projectId: string) {
  return db.select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.percentage));
}

export async function createMilestone(data: {
  projectId: string;
  title: string;
  amount: number;
  percentage: number;
  dueDate?: string;
}) {
  const id = crypto.randomUUID();
  
  await db.insert(milestones).values({
    id,
    projectId: data.projectId,
    title: data.title,
    amount: data.amount,
    percentage: data.percentage,
    dueDate: data.dueDate || null,
    isPaid: false,
  });
  
  return db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
}

export async function updateMilestone(id: string, data: Partial<{
  title: string;
  amount: number;
  percentage: number;
  isPaid: boolean;
  dueDate: string;
}>) {
  await db.update(milestones)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(milestones.id, id));
}

export async function deleteMilestone(id: string) {
  await db.delete(milestones).where(eq(milestones.id, id));
}

// ============ TASKS ============

export async function getTasksByProject(projectId: string) {
  return db.select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  estimatedCost?: number;
}) {
  const id = crypto.randomUUID();
  
  await db.insert(tasks).values({
    id,
    projectId: data.projectId,
    title: data.title,
    description: data.description || null,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    estimatedCost: data.estimatedCost || 0,
  });
  
  return db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
}

export async function updateTask(id: string, data: Partial<{
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedCost: number;
  actualCost: number;
  hours: number;
  sortOrder: number;
}>) {
  await db.update(tasks)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));
}

export async function deleteTask(id: string) {
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ============ ENTITIES (Vendor/Client) ============

export async function getEntities(type?: 'vendor' | 'client') {
  if (type) {
    return db.select().from(entities).where(eq(entities.type, type)).orderBy(asc(entities.name));
  }
  return db.select().from(entities).orderBy(asc(entities.name));
}

export async function getEntityById(id: string) {
  const result = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
  return result[0] || null;
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
  const id = crypto.randomUUID();
  
  await db.insert(entities).values({
    id,
    name: data.name,
    type: data.type,
    contact: data.contact || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    notes: data.notes || null,
  });
  
  return getEntityById(id);
}

export async function updateEntity(id: string, data: Partial<{
  name: string;
  type: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}>) {
  await db.update(entities)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(entities.id, id));
  
  return getEntityById(id);
}

export async function deleteEntity(id: string) {
  await db.delete(entities).where(eq(entities.id, id));
}

export async function getEntitySpendingStats(entityId: string) {
  const entityTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.entityId, entityId));
  
  const totalSpent = entityTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPaid = entityTransactions
    .filter(t => t.type === 'expense' && t.paymentStatus === 'lunas')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalUnpaid = entityTransactions
    .filter(t => t.type === 'expense' && t.paymentStatus !== 'lunas')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);
  
  return {
    transactionCount: entityTransactions.length,
    totalSpent,
    totalPaid,
    totalUnpaid,
  };
}

// ============ TRANSACTIONS ============

export async function getTransactions(projectId?: string) {
  if (projectId) {
    return db.select()
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .orderBy(desc(transactions.transactionDate));
  }
  return db.select().from(transactions).orderBy(desc(transactions.transactionDate));
}

export async function getTransactionById(id: string) {
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result[0] || null;
}

export async function createTransaction(data: {
  projectId: string;
  entityId?: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  imageData?: string;
  paymentStatus?: 'lunas' | 'belum_lunas' | 'cicilan';
  paidAmount?: number;
  dueDate?: string;
  paymentMethod?: string;
  transactionDate?: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.insert(transactions).values({
    id,
    projectId: data.projectId,
    entityId: data.entityId || null,
    type: data.type,
    amount: data.amount,
    description: data.description || null,
    imageData: data.imageData || null,
    paymentStatus: data.paymentStatus || 'lunas',
    paidAmount: data.paidAmount || 0,
    dueDate: data.dueDate || null,
    paidDate: data.paymentStatus === 'lunas' ? now : null,
    paymentMethod: data.paymentMethod || null,
    transactionDate: data.transactionDate || now,
  });
  
  return getTransactionById(id);
}

export async function updateTransaction(id: string, data: Partial<{
  entityId: string;
  type: string;
  amount: number;
  description: string;
  paymentStatus: string;
  paidAmount: number;
  dueDate: string;
  paidDate: string;
  paymentMethod: string;
  transactionDate: string;
}>) {
  const existing = await getTransactionById(id);
  if (!existing) return null;
  
  // Auto-update payment status
  let paymentStatus = data.paymentStatus || existing.paymentStatus;
  let paidAmount = data.paidAmount ?? existing.paidAmount;
  let paidDate = data.paidDate || existing.paidDate;
  
  // Auto-update: cicilan -> lunas
  if ((paidAmount || 0) >= existing.amount && paymentStatus === 'cicilan') {
    paymentStatus = 'lunas';
    paidDate = new Date().toISOString();
  }
  
  await db.update(transactions)
    .set({ 
      ...data, 
      paymentStatus,
      paidAmount,
      paidDate,
      updatedAt: new Date().toISOString() 
    })
    .where(eq(transactions.id, id));
  
  return getTransactionById(id);
}

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id));
}

// ============ TRANSACTION ITEMS ============

export async function getTransactionItems(transactionId: string) {
  return db.select().from(transactionItems).where(eq(transactionItems.transactionId, transactionId));
}

export async function createTransactionItem(data: {
  transactionId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}) {
  const id = crypto.randomUUID();
  const totalPrice = data.quantity * data.unitPrice;
  
  await db.insert(transactionItems).values({
    id,
    transactionId: data.transactionId,
    description: data.description,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalPrice,
  });
}

export async function deleteTransactionItems(transactionId: string) {
  await db.delete(transactionItems).where(eq(transactionItems.transactionId, transactionId));
}

// ============ AI SCANS ============

export async function createAiScan(data: {
  imageData: string;
  status?: 'pending' | 'processed' | 'failed';
}) {
  const id = crypto.randomUUID();
  
  await db.insert(aiScans).values({
    id,
    imageData: data.imageData,
    status: data.status || 'pending',
  });
  
  return db.select().from(aiScans).where(eq(aiScans.id, id)).limit(1);
}

export async function updateAiScan(id: string, data: {
  rawResponse?: string;
  vendorName?: string;
  transactionDate?: string;
  totalAmount?: number;
  status?: string;
  errorMessage?: string;
}) {
  await db.update(aiScans)
    .set(data)
    .where(eq(aiScans.id, id));
}

// ============ SEARCH ============

export async function searchEntities(query: string) {
  const searchPattern = `%${query}%`;
  return db.select()
    .from(entities)
    .where(or(
      like(entities.name, searchPattern),
      like(entities.email, searchPattern),
      like(entities.phone, searchPattern)
    ));
}