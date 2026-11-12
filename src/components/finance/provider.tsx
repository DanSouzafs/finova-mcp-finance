import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { demoTransactions, demoGoals, type Transaction, type Goal } from "@/lib/finance";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface FinanceContextType {
  user: UserProfile | null;
  ready: boolean;
  light: boolean;
  setLight: (val: boolean) => void;
  transactions: Transaction[];
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  showAuthScreen: boolean;
  setShowAuthScreen: (val: boolean) => void;
  saveTransaction: (t: Omit<Transaction, "id">, id?: string) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  saveGoal: (g: Omit<Goal, "id">, id?: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (name: string, email: string, password?: string) => Promise<boolean>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  resetToDefault: () => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEYS = {
  TXS: "finova_transactions_v1",
  GOALS: "finova_goals_v1",
  THEME: "finova_theme_v1",
  USER: "finova_user_v1",
};

export const DEFAULT_DEMO_USER: UserProfile = {
  id: "usr-demo-01",
  email: "daniel@finova.app",
  user_metadata: {
    full_name: "Daniel Silva",
  },
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  const [light, setLightState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved === "light";
    }
    return false;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) return parsed;
        }
      } catch (e) {
        console.error("Error reading cached user", e);
      }
    }
    return DEFAULT_DEMO_USER;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.TXS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error loading cached transactions", e);
      }
    }
    return demoTransactions;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.GOALS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error loading cached goals", e);
      }
    }
    return demoGoals;
  });

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.THEME, light ? "light" : "dark");
      if (light) {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      }
    }
  }, [light]);

  const setLight = (val: boolean) => {
    setLightState(val);
  };

  async function signIn(email: string, _password?: string): Promise<boolean> {
    const formattedEmail = email.trim().toLowerCase();
    let nameGuess = formattedEmail.split("@")[0] || "Usuário";
    nameGuess = nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1);

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: formattedEmail,
      user_metadata: {
        full_name: nameGuess,
      },
    };

    setUser(newUser);
    setShowAuthScreen(false);
    toast.success(`Bem-vindo de volta, ${nameGuess}!`);
    return true;
  }

  async function signUp(name: string, email: string, _password?: string): Promise<boolean> {
    const formattedName = name.trim();
    const formattedEmail = email.trim().toLowerCase();

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: formattedEmail,
      user_metadata: {
        full_name: formattedName,
      },
    };

    setUser(newUser);
    setShowAuthScreen(false);
    toast.success(`Conta criada com sucesso! Bem-vindo ao finova, ${formattedName}.`);
    return true;
  }

  function signInDemo() {
    setUser(DEFAULT_DEMO_USER);
    setShowAuthScreen(false);
    toast.success("Acessando com a conta demonstrativa de Daniel Silva!");
  }

  async function saveTransaction(t: Omit<Transaction, "id">, id?: string) {
    if (id) {
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? { ...t, id } : item))
      );
      toast.success("Transação atualizada com sucesso!");
    } else {
      const newTx: Transaction = {
        ...t,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      toast.success("Transação registrada!");
    }
  }

  async function removeTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transação excluída");
  }

  async function saveGoal(g: Omit<Goal, "id">, id?: string) {
    if (id) {
      setGoals((prev) =>
        prev.map((item) => (item.id === id ? { ...g, id } : item))
      );
      toast.success("Meta atualizada!");
    } else {
      const newGoal: Goal = {
        ...g,
        id: `gl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setGoals((prev) => [...prev, newGoal]);
      toast.success("Meta/Orçamento adicionado!");
    }
  }

  async function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Meta/Orçamento excluído");
  }

  async function signOut() {
    setUser(null);
    setShowAuthScreen(true);
    toast.info("Você saiu da conta.");
  }

  function resetToDefault() {
    setTransactions(demoTransactions);
    setGoals(demoGoals);
    setUser(DEFAULT_DEMO_USER);
    localStorage.removeItem(STORAGE_KEYS.TXS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    toast.success("Dados restaurados para o padrão de demonstração!");
  }

  const value: FinanceContextType = {
    user,
    ready,
    light,
    setLight,
    transactions,
    goals,
    loading: false,
    error: null,
    showAuthScreen,
    setShowAuthScreen,
    saveTransaction,
    removeTransaction,
    saveGoal,
    removeGoal,
    signIn,
    signUp,
    signInDemo,
    signOut,
    resetToDefault,
  };

  return (
    <FinanceContext.Provider value={value}>
      <div className={light ? "finance-theme light" : "finance-theme"}>
        {children}
      </div>
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("FinanceProvider required");
  return ctx;
}
