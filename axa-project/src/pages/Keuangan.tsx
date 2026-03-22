import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import * as api from '@/lib/api';

interface Project {
  id: string;
  number: string;
  name: string;
  budget: number;
  startDate: string | null;
  endDate: string | null;
}

interface Transaction {
  id: string;
  projectId: string;
  type: string;
  amount: number;
  description: string | null;
  paymentStatus: string;
  paidAmount: number;
  transactionDate: string | null;
}

export function Keuangan() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTransactions();
    }
  }, [selectedProject]);

  async function loadData() {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    if (!selectedProject) return;
    try {
      const data = await api.getTransactions(selectedProject);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  
  // Calculate stats
  const projectTransactions = transactions.filter(t => t.projectId === selectedProject);
  const totalIncome = projectTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = projectTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const accountsPayable = projectTransactions
    .filter(t => t.paymentStatus !== 'lunas')
    .reduce((sum, t) => sum + (t.amount - t.paidAmount), 0);
  
  const budget = selectedProjectData?.budget || 0;
  const actualSpent = totalExpense;
  const budgetUsedPercent = budget > 0 ? (actualSpent / budget) * 100 : 0;
  const budgetRemaining = budget - actualSpent;
  
  // Payment Liability = budget - actual spent - unpaid
  const paymentLiability = budget - actualSpent - accountsPayable;
  
  // Burn rate (daily average spending)
  const startDate = selectedProjectData?.startDate ? new Date(selectedProjectData.startDate) : null;
  const daysActive = startDate ? Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 1;
  const burnRate = actualSpent / daysActive;
  const daysUntilBudgetRunsOut = burnRate > 0 ? Math.floor(budgetRemaining / burnRate) : 0;
  
  // Threshold colors
  const getThresholdColor = (percent: number) => {
    if (percent >= 80) return 'bg-error';
    if (percent >= 60) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getThresholdText = (percent: number) => {
    if (percent >= 80) return 'text-error';
    if (percent >= 60) return 'text-yellow-500';
    return 'text-primary';
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'lunas':
        return 'bg-primary/20 text-primary';
      case 'belum_lunas':
        return 'bg-error/20 text-error';
      case 'cicilan':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'lunas':
        return 'Lunas';
      case 'belum_lunas':
        return 'Belum Lunas';
      case 'cicilan':
        return 'Cicilan';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Keuangan</h1>
          <p className="text-zinc-500 text-sm mt-1">Arus kas dan budget forecasting</p>
        </div>
        
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface focus:outline-none focus:border-primary/40"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>
          ))}
        </select>
      </div>

      {/* Budget Overview */}
      <div className="bg-surface-container-low p-6 rounded-lg">
        <h3 className="font-headline font-semibold text-on-surface mb-4">Budget Overview</h3>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-surface-container-high rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Budget</p>
            <p className="text-xl font-headline font-bold text-primary mt-1">{formatCurrency(budget)}</p>
          </div>
          <div className="text-center p-4 bg-surface-container-high rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Terpakai</p>
            <p className="text-xl font-headline font-bold text-on-surface mt-1">{formatCurrency(actualSpent)}</p>
          </div>
          <div className="text-center p-4 bg-surface-container-high rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Sisa Budget</p>
            <p className={`text-xl font-headline font-bold mt-1 ${budgetRemaining >= 0 ? 'text-tertiary' : 'text-error'}`}>
              {formatCurrency(budgetRemaining)}
            </p>
          </div>
          <div className="text-center p-4 bg-surface-container-high rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Hutang</p>
            <p className="text-xl font-headline font-bold text-error mt-1">{formatCurrency(accountsPayable)}</p>
          </div>
          <div className="text-center p-4 bg-surface-container-high rounded-lg">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Payment Liability</p>
            <p className={`text-xl font-headline font-bold mt-1 ${paymentLiability >= 0 ? 'text-tertiary' : 'text-error'}`}>
              {formatCurrency(paymentLiability)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-zinc-400">Budget Usage</span>
            <span className={`text-sm font-label ${getThresholdText(budgetUsedPercent)}`}>
              {budgetUsedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${getThresholdColor(budgetUsedPercent)}`}
              style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>0%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Threshold Info */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary" />
            <span className="text-zinc-400">Normal (&lt;60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-zinc-400">Warning (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-error" />
            <span className="text-zinc-400">Critical (&gt;80%)</span>
          </div>
        </div>
      </div>

      {/* Burn Rate & Forecast */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-container-low p-6 rounded-lg">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Burn Rate</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Rata-rata pengeluaran per hari</span>
              <span className="text-lg font-headline font-bold text-primary">{formatCurrency(burnRate)}/hari</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Estimasi budget habis dalam</span>
              <span className={`text-lg font-headline font-bold ${daysUntilBudgetRunsOut > 0 ? 'text-tertiary' : 'text-error'}`}>
                {daysUntilBudgetRunsOut > 0 ? `${daysUntilBudgetRunsOut} hari` : 'Budget sudah habis'}
              </span>
            </div>
            {startDate && (
              <div className="text-xs text-zinc-500">
                Project dimulai: {formatDate(startDate)} ({daysActive} hari)
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-lg">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Cash Flow</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Pemasukan</span>
              <span className="text-lg font-headline font-bold text-tertiary">+{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Pengeluaran</span>
              <span className="text-lg font-headline font-bold text-error">-{formatCurrency(totalExpense)}</span>
            </div>
            <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-center">
              <span className="text-on-surface font-label">Net Cash Flow</span>
              <span className={`text-xl font-headline font-bold ${totalIncome - totalExpense >= 0 ? 'text-tertiary' : 'text-error'}`}>
                {totalIncome - totalExpense >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-surface-container-low p-6 rounded-lg">
        <h3 className="font-headline font-semibold text-on-surface mb-4">Riwayat Transaksi</h3>
        
        {projectTransactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    t.type === 'income' ? 'bg-tertiary/10' : 'bg-error/10'
                  }`}>
                    <svg className={`w-5 h-5 ${t.type === 'income' ? 'text-tertiary' : 'text-error'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {t.type === 'income' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-on-surface font-label">{t.description || t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                    <p className="text-xs text-zinc-500">{t.transactionDate ? formatDate(t.transactionDate) : '-'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-headline font-semibold ${t.type === 'income' ? 'text-tertiary' : 'text-on-surface'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${getPaymentStatusBadge(t.paymentStatus)}`}>
                    {getPaymentStatusText(t.paymentStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}