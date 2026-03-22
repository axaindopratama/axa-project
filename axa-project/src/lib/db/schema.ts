import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table (Better Auth will add more columns)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }),
  image: text('image'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Sessions table (Better Auth)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at'),
  token: text('token').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id),
});

// Accounts table (Better Auth - OAuth)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at'),
  refreshTokenExpiresAt: integer('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Verification table (Better Auth)
export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  number: text('number').notNull(), // 3-digit format: 001, 002, etc.
  name: text('name').notNull(),
  description: text('description'),
  budget: real('budget').notNull().default(0),
  status: text('status').notNull().default('active'), // active, completed, archived
  startDate: text('start_date'),
  endDate: text('end_date'),
  hourlyRate: real('hourly_rate').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Milestones table
export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  amount: real('amount').notNull().default(0),
  percentage: real('percentage').notNull().default(0),
  isPaid: integer('is_paid', { mode: 'boolean' }).default(false),
  paidAt: text('paid_at'),
  dueDate: text('due_date'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('todo'), // todo, in_progress, done
  priority: text('priority').default('medium'), // low, medium, high
  estimatedCost: real('estimated_cost').default(0),
  actualCost: real('actual_cost').default(0),
  hours: real('hours').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Entities table (Vendor/Client)
export const entities = sqliteTable('entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // vendor, client
  contact: text('contact'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  entityId: text('entity_id').references(() => entities.id),
  type: text('type').notNull(), // income, expense
  amount: real('amount').notNull().default(0),
  description: text('description'),
  receiptUrl: text('receipt_url'),
  imageData: text('image_data'), // Base64 or stored image path
  
  // Payment status tracking
  paymentStatus: text('payment_status').notNull().default('lunas'), // lunas, belum_lunas, cicilan
  paidAmount: real('paid_amount').default(0),
  dueDate: text('due_date'),
  paidDate: text('paid_date'),
  paymentMethod: text('payment_method'), // cash, transfer, qris, etc.
  
  transactionDate: text('transaction_date'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Transaction items (detail from AI scan)
export const transactionItems = sqliteTable('transaction_items', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull().default(0),
  totalPrice: real('total_price').notNull().default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// AI Scan History
export const aiScans = sqliteTable('ai_scans', {
  id: text('id').primaryKey(),
  imageData: text('image_data').notNull(),
  rawResponse: text('raw_response'),
  vendorName: text('vendor_name'),
  transactionDate: text('transaction_date'),
  totalAmount: real('total_amount'),
  status: text('status').notNull().default('pending'), // pending, processed, failed
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;
export type AiScan = typeof aiScans.$inferSelect;
export type NewAiScan = typeof aiScans.$inferInsert;