import { createContext, useContext, useMemo } from 'react';

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
};

export type BudgetItem = {
  category: string;
  spent: number;
  limit: number;
  color: string;
};

export type Goal = {
  title: string;
  current: number;
  target: number;
  image: string;
  accent: string;
};

const accounts: Account[] = [
  { id: 'acc-1', name: 'Main account', balance: 18420.4, type: 'checking', currency: 'BRL' },
  { id: 'acc-2', name: 'Emergency fund', balance: 24880.0, type: 'savings', currency: 'BRL' },
  { id: 'acc-3', name: 'Investment portfolio', balance: 54000.0, type: 'investment', currency: 'USD' },
  { id: 'acc-4', name: 'Credit card', balance: -3240.12, type: 'credit', currency: 'BRL' },
];

const transactions: Transaction[] = [
  { id: 'txn-1', description: 'Salary', amount: 7200, category: 'Income', date: '2026-11-12', type: 'income', status: 'completed' },
  { id: 'txn-2', description: 'Rent', amount: -1800, category: 'Housing', date: '2026-11-10', type: 'expense', status: 'completed' },
  { id: 'txn-3', description: 'Supermarket', amount: -420.5, category: 'Food', date: '2026-11-09', type: 'expense', status: 'completed' },
  { id: 'txn-4', description: 'Consulting', amount: 2800, category: 'Services', date: '2026-11-08', type: 'income', status: 'pending' },
  { id: 'txn-5', description: 'Flight ticket', amount: -1200, category: 'Travel', date: '2026-11-05', type: 'expense', status: 'completed' },
  { id: 'txn-6', description: 'Gym', amount: -150, category: 'Health', date: '2026-11-03', type: 'expense', status: 'completed' },
];

const budgetItems: BudgetItem[] = [
  { category: 'Housing', spent: 1800, limit: 2200, color: '#22c55e' },
  { category: 'Food', spent: 920, limit: 1200, color: '#14b8a6' },
  { category: 'Transport', spent: 430, limit: 600, color: '#f59e0b' },
  { category: 'Lifestyle', spent: 650, limit: 900, color: '#8b5cf6' },
];

const goals: Goal[] = [
  { title: 'Travel to Lisbon', current: 4200, target: 9000, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', accent: '#22c55e' },
  { title: 'Emergency fund', current: 24880, target: 40000, image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80', accent: '#14b8a6' },
];

const cashFlow = [
  { month: 'Jan', income: 4200, expense: 2800 },
  { month: 'Feb', income: 4700, expense: 3100 },
  { month: 'Mar', income: 5200, expense: 2900 },
  { month: 'Apr', income: 6100, expense: 3400 },
  { month: 'May', income: 6600, expense: 3600 },
  { month: 'Jun', income: 7200, expense: 4100 },
];

const metricCards = [
  { label: 'Cash balance', value: 'R$ 18.420,40', change: '+8.4%' },
  { label: 'Income this month', value: 'R$ 7.200,00', change: '+12.1%' },
  { label: 'Expenses this month', value: 'R$ 4.870,50', change: '-3.2%' },
  { label: 'Savings rate', value: '28.4%', change: '+4.3%' },
];

type FinanceContextValue = {
  accounts: Account[];
  transactions: Transaction[];
  budgetItems: BudgetItem[];
  goals: Goal[];
  cashFlow: typeof cashFlow;
  metricCards: typeof metricCards;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<FinanceContextValue>(() => ({
    accounts,
    transactions,
    budgetItems,
    goals,
    cashFlow,
    metricCards,
  }), []);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
}
