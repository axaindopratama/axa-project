import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()
const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url?.startsWith('/api/')) {
        // Import db inside the handler to avoid issues
        const { db } = await import('./src/lib/db');
        const { projects, entities, transactions, milestones, tasks } = await import('./src/lib/db/schema');
        const { eq, desc, asc } = await import('drizzle-orm');
        
        const url = req.url?.replace('/api/', '') || '';
        
        try {
          // Projects
          if (url === 'projects' && req.method === 'GET') {
            const data = await db.select().from(projects).orderBy(desc(projects.createdAt));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }
          
          if (url === 'projects/stats' && req.method === 'GET') {
            const allProjects = await db.select().from(projects);
            const activeProjects = allProjects.filter((p: any) => p.status === 'active');
            const totalBudget = allProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
            
            const allTransactions = await db.select().from(transactions);
            const totalSpent = allTransactions
              .filter((t: any) => t.type === 'expense')
              .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
            
            const accountsPayable = allTransactions
              .filter((t: any) => t.paymentStatus !== 'lunas')
              .reduce((sum: number, t: any) => sum + ((t.amount || 0) - (t.paidAmount || 0)), 0);
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              totalProjects: allProjects.length,
              activeProjects: activeProjects.length,
              totalBudget,
              totalSpent,
              accountsPayable,
            }));
            return;
          }
          
          if (url.startsWith('projects/') && url.endsWith('/milestones') && req.method === 'GET') {
            const projectId = url.split('/')[1];
            const data = await db.select()
              .from(milestones)
              .where(eq(milestones.projectId, projectId))
              .orderBy(asc(milestones.percentage));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }
          
          if (url.startsWith('projects/') && url.endsWith('/tasks') && req.method === 'GET') {
            const projectId = url.split('/')[1];
            const data = await db.select()
              .from(tasks)
              .where(eq(tasks.projectId, projectId))
              .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }
          
          if (url.startsWith('projects/') && req.method === 'GET' && !url.includes('/milestones') && !url.includes('/tasks')) {
            const id = url.split('/')[1];
            const data = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data[0] || null));
            return;
          }
          
          if (url === 'projects' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            
            const result = await db.select({ number: projects.number })
              .from(projects)
              .orderBy(desc(projects.number))
              .limit(1);
            const number = result.length === 0 ? '001' : String(parseInt(result[0].number, 10) + 1).padStart(3, '0');
            const id = crypto.randomUUID();
            
            await db.insert(projects).values({
              id,
              number,
              name: data.name,
              description: data.description || null,
              budget: data.budget || 0,
              status: 'active',
              startDate: data.startDate || null,
              endDate: data.endDate || null,
              hourlyRate: data.hourlyRate || 0,
            });
            
            const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(created[0]));
            return;
          }
          
          // Update Project (PUT /api/projects/:id)
          if (url.startsWith('projects/') && req.method === 'PUT') {
            const id = url.split('/')[1];
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            
            await db.update(projects)
              .set({ 
                ...data, 
                updatedAt: new Date().toISOString() 
              })
              .where(eq(projects.id, id));
            
            const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(updated[0]));
            return;
          }
          
          // Delete Project (DELETE /api/projects/:id)
          if (url.startsWith('projects/') && req.method === 'DELETE') {
            const id = url.split('/')[1];
            await db.delete(projects).where(eq(projects.id, id));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
          
          // Entities
          if (url === 'entities' && req.method === 'GET') {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const type = urlObj.searchParams.get('type');
            let data;
            if (type) {
              data = await db.select().from(entities).where(eq(entities.type, type)).orderBy(asc(entities.name));
            } else {
              data = await db.select().from(entities).orderBy(asc(entities.name));
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }
          
          if (url === 'entities' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
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
            
            const created = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(created[0]));
            return;
          }
          
          // Milestones
          if (url.startsWith('milestones/') && req.method === 'PUT') {
            const id = url.split('/')[1];
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            
            await db.update(milestones)
              .set({ ...data, updatedAt: new Date().toISOString() })
              .where(eq(milestones.id, id));
            
            const updated = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(updated[0]));
            return;
          }
          
          if (url === 'milestones' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            const id = crypto.randomUUID();
            
            await db.insert(milestones).values({
              id,
              projectId: data.projectId,
              title: data.title,
              amount: data.amount || 0,
              percentage: data.percentage || 0,
              dueDate: data.dueDate || null,
              isPaid: false,
            });
            
            const created = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(created[0]));
            return;
          }
          
          // Tasks - Create
          if (url === 'tasks' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            const id = crypto.randomUUID();
            
            await db.insert(tasks).values({
              id,
              projectId: data.projectId,
              title: data.title,
              description: data.description || null,
              status: data.status || 'todo',
              priority: data.priority || 'medium',
              estimatedCost: data.estimatedCost || 0,
              actualCost: data.actualCost || 0,
              hours: data.hours || 0,
            });
            
            const created = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(created[0]));
            return;
          }
          
          // Tasks - Update
          if (url.startsWith('tasks/') && req.method === 'PUT') {
            const id = url.split('/')[1];
            let body = '';
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body);
            
            await db.update(tasks)
              .set({ ...data, updatedAt: new Date().toISOString() })
              .where(eq(tasks.id, id));
            
            const updated = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(updated[0]));
            return;
          }
          
          // Tasks - Delete
          if (url.startsWith('tasks/') && req.method === 'DELETE') {
            const id = url.split('/')[1];
            await db.delete(tasks).where(eq(tasks.id, id));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
          
        } catch (error) {
          console.error('API Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});