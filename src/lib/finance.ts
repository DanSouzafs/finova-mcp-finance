export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "completed" | "pending";
}

export interface Goal {
  id: string;
  name: string;
  kind: "budget" | "goal";
  target: number;
  current: number;
  saved?: number;
  deadline?: string;
  category?: string;
}

export const categories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Salário",
  "Freelance",
  "Investimentos",
  "Educação",
  "Outros",
] as const;

export function money(amount: number): string {
  if (isNaN(amount)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function summarize(transactions: Transaction[]) {
  const income = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;
  const rate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

  return { income, expense, balance, rate };
}

export function budgetSpent(transactions: Transaction[], category: string): number {
  return transactions
    .filter((t) => t.type === "expense" && t.category === category && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function filterTransactions(
  transactions: Transaction[],
  search: string,
  start?: string,
  end?: string,
  type: string = "all"
): Transaction[] {
  return transactions.filter((t) => {
    if (type !== "all" && t.type !== type) return false;
    if (start && t.date < start) return false;
    if (end && t.date > end) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// Generate realistic dynamic dates based on current date
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth() + 1;
const pad = (n: number) => String(n).padStart(2, "0");

const dateStr = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

export const demoTransactions: Transaction[] = [
  // Current month
  {
    id: "tx-1",
    description: "Salário Fintech Senior Tech Lead",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m, 5),
    status: "completed",
  },
  {
    id: "tx-2",
    description: "Freelance Design System & UI",
    category: "Freelance",
    amount: 4200.0,
    type: "income",
    date: dateStr(y, m, 8),
    status: "completed",
  },
  {
    id: "tx-3",
    description: "Aluguel & Condomínio Jardins",
    category: "Moradia",
    amount: 3200.0,
    type: "expense",
    date: dateStr(y, m, 7),
    status: "completed",
  },
  {
    id: "tx-4",
    description: "Supermercado Pão de Açúcar Especial",
    category: "Alimentação",
    amount: 864.5,
    type: "expense",
    date: dateStr(y, m, 9),
    status: "completed",
  },
  {
    id: "tx-5",
    description: "Jantar Restaurante D.O.M.",
    category: "Alimentação",
    amount: 480.0,
    type: "expense",
    date: dateStr(y, m, 10),
    status: "completed",
  },
  {
    id: "tx-6",
    description: "Uber & Recarga Sem Parar",
    category: "Transporte",
    amount: 320.0,
    type: "expense",
    date: dateStr(y, m, 11),
    status: "completed",
  },
  {
    id: "tx-7",
    description: "Netflix, Spotify & Apple One",
    category: "Lazer",
    amount: 119.9,
    type: "expense",
    date: dateStr(y, m, 11),
    status: "completed",
  },
  {
    id: "tx-8",
    description: "Mensalidade Academia Bio Ritmo",
    category: "Saúde",
    amount: 299.0,
    type: "expense",
    date: dateStr(y, m, 2),
    status: "completed",
  },
  {
    id: "tx-9",
    description: "Consultoria Cloud Architecture",
    category: "Freelance",
    amount: 3500.0,
    type: "income",
    date: dateStr(y, m, 15),
    status: "pending",
  },
  {
    id: "tx-10",
    description: "Farmácia Drogasil Vitaminas",
    category: "Saúde",
    amount: 145.8,
    type: "expense",
    date: dateStr(y, m, 12),
    status: "completed",
  },
  {
    id: "tx-11",
    description: "Gasolina Posto Shell V-Power",
    category: "Transporte",
    amount: 280.0,
    type: "expense",
    date: dateStr(y, m, 14),
    status: "completed",
  },
  {
    id: "tx-12",
    description: "Cinema IMAX & Pipoca",
    category: "Lazer",
    amount: 135.0,
    type: "expense",
    date: dateStr(y, m, 6),
    status: "completed",
  },

  // Past Month - 1
  {
    id: "tx-m1-1",
    description: "Salário Fintech Senior Tech Lead",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m > 1 ? m - 1 : 12, 5),
    status: "completed",
  },
  {
    id: "tx-m1-2",
    description: "Dividendos FIIs & Ações",
    category: "Salário",
    amount: 1120.0,
    type: "income",
    date: dateStr(y, m > 1 ? m - 1 : 12, 14),
    status: "completed",
  },
  {
    id: "tx-m1-3",
    description: "Aluguel & Condomínio Jardins",
    category: "Moradia",
    amount: 3200.0,
    type: "expense",
    date: dateStr(y, m > 1 ? m - 1 : 12, 7),
    status: "completed",
  },
  {
    id: "tx-m1-4",
    description: "Compras Mês Supermercado St Marche",
    category: "Alimentação",
    amount: 1420.0,
    type: "expense",
    date: dateStr(y, m > 1 ? m - 1 : 12, 12),
    status: "completed",
  },
  {
    id: "tx-m1-5",
    description: "Manutenção Carro & Troca de Óleo",
    category: "Transporte",
    amount: 650.0,
    type: "expense",
    date: dateStr(y, m > 1 ? m - 1 : 12, 18),
    status: "completed",
  },

  // Past Month - 2
  {
    id: "tx-m2-1",
    description: "Salário Fintech Senior Tech Lead",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m > 2 ? m - 2 : 11, 5),
    status: "completed",
  },
  {
    id: "tx-m2-2",
    description: "Projeto Frontend MVP Freelance",
    category: "Freelance",
    amount: 5800.0,
    type: "income",
    date: dateStr(y, m > 2 ? m - 2 : 11, 20),
    status: "completed",
  },
  {
    id: "tx-m2-3",
    description: "Aluguel & Condomínio Jardins",
    category: "Moradia",
    amount: 3200.0,
    type: "expense",
    date: dateStr(y, m > 2 ? m - 2 : 11, 7),
    status: "completed",
  },
  {
    id: "tx-m2-4",
    description: "Despesas Gerais & Alimentação",
    category: "Alimentação",
    amount: 1780.0,
    type: "expense",
    date: dateStr(y, m > 2 ? m - 2 : 11, 15),
    status: "completed",
  },
  {
    id: "tx-m2-5",
    description: "Viagem Fim de Semana Serra",
    category: "Lazer",
    amount: 980.0,
    type: "expense",
    date: dateStr(y, m > 2 ? m - 2 : 11, 22),
    status: "completed",
  },

  // Past Month - 3
  {
    id: "tx-m3-1",
    description: "Salário Mensal",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m > 3 ? m - 3 : 10, 5),
    status: "completed",
  },
  {
    id: "tx-m3-2",
    description: "Gastos Gerais Mês",
    category: "Moradia",
    amount: 5100.0,
    type: "expense",
    date: dateStr(y, m > 3 ? m - 3 : 10, 15),
    status: "completed",
  },

  // Past Month - 4
  {
    id: "tx-m4-1",
    description: "Salário Mensal",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m > 4 ? m - 4 : 9, 5),
    status: "completed",
  },
  {
    id: "tx-m4-2",
    description: "Gastos Gerais Mês",
    category: "Moradia",
    amount: 5400.0,
    type: "expense",
    date: dateStr(y, m > 4 ? m - 4 : 9, 15),
    status: "completed",
  },

  // Past Month - 5
  {
    id: "tx-m5-1",
    description: "Salário Mensal",
    category: "Salário",
    amount: 14500.0,
    type: "income",
    date: dateStr(y, m > 5 ? m - 5 : 8, 5),
    status: "completed",
  },
  {
    id: "tx-m5-2",
    description: "Gastos Gerais Mês",
    category: "Moradia",
    amount: 4950.0,
    type: "expense",
    date: dateStr(y, m > 5 ? m - 5 : 8, 15),
    status: "completed",
  },
];

export const demoGoals: Goal[] = [
  // Budgets (kind === 'budget')
  {
    id: "bg-1",
    name: "Alimentação",
    kind: "budget",
    target: 2000,
    current: 1344.5,
    category: "Alimentação",
  },
  {
    id: "bg-2",
    name: "Moradia",
    kind: "budget",
    target: 3500,
    current: 3200,
    category: "Moradia",
  },
  {
    id: "bg-3",
    name: "Transporte",
    kind: "budget",
    target: 800,
    current: 600,
    category: "Transporte",
  },
  {
    id: "bg-4",
    name: "Lazer & Cultura",
    kind: "budget",
    target: 600,
    current: 254.9,
    category: "Lazer",
  },
  {
    id: "bg-5",
    name: "Saúde & Bem-estar",
    kind: "budget",
    target: 700,
    current: 444.8,
    category: "Saúde",
  },

  // Goals (kind === 'goal')
  {
    id: "gl-1",
    name: "Viagem Japão Primavera",
    kind: "goal",
    target: 28000,
    current: 19600,
    deadline: "2027-04-15",
  },
  {
    id: "gl-2",
    name: "Reserva de Emergência (6 meses)",
    kind: "goal",
    target: 45000,
    current: 38500,
    deadline: "2026-12-31",
  },
  {
    id: "gl-3",
    name: "Aporte Carteira Global Tech",
    kind: "goal",
    target: 20000,
    current: 14000,
    deadline: "2026-12-15",
  },
];
