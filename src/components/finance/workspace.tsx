import { useMemo, useState, type FormEvent, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Bot,
  User,
  ArrowLeftRight,
  Target,
  ChartNoAxesCombined,
  Settings,
  Wallet,
  Plus,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Download,
  CalendarDays,
  Ellipsis,
  Utensils,
  House,
  Car,
  Clapperboard,
  HeartPulse,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  Info,
  ShieldCheck,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  TriangleAlert,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useFinance } from "./provider";
import { McpAssistant } from "./mcp-assistant";
import {
  money,
  categories,
  summarize,
  filterTransactions,
  budgetSpent,
  type Transaction,
  type Goal,
} from "@/lib/finance";
import travel from "@/assets/travel-goal.jpg";
import { toast } from "sonner";

type ViewType = "overview" | "transactions" | "goals" | "analysis" | "chat" | "settings";

const navItems = [
  { id: "overview" as ViewType, label: "Visão geral", path: "/", icon: LayoutDashboard },
  { id: "chat" as ViewType, label: "Assistente IA (MCP)", path: "/chat", icon: Bot },
  { id: "transactions" as ViewType, label: "Transações", path: "/transactions", icon: ArrowLeftRight },
  { id: "goals" as ViewType, label: "Metas & orçamentos", path: "/goals", icon: Target },
  { id: "analysis" as ViewType, label: "Análise & investimentos", path: "/analysis", icon: ChartNoAxesCombined },
  { id: "settings" as ViewType, label: "Configurações", path: "/settings", icon: Settings },
] as const;

const icons: Record<string, typeof Wallet> = {
  Alimentação: Utensils,
  Moradia: House,
  Transporte: Car,
  Lazer: Clapperboard,
  Saúde: HeartPulse,
  Salário: BriefcaseBusiness,
  Freelance: BriefcaseBusiness,
  Investimentos: TrendingUp,
  Educação: GraduationCap,
  Outros: Sparkles,
};

const chartColors = [
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#64748b", // slate
];

export function Workspace({
  view: initialView = "overview",
  onOpenAuth,
}: {
  view?: ViewType;
  onOpenAuth?: () => void;
}) {
  const f = useFinance();
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const currentStart = `${year}-${month}-01`;
  const currentEnd = `${year}-${month}-31`;

  const [start, setStart] = useState(currentStart);
  const [end, setEnd] = useState(currentEnd);
  const [type, setType] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [goalModal, setGoalModal] = useState(false);
  const [goalEdit, setGoalEdit] = useState<Goal | undefined>();
  const [hidden, setHidden] = useState(false);
  const [settingsTab, setSettingsTab] = useState("Conta");
  const [helpModal, setHelpModal] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  // Global keyboard shortcut: cmd/ctrl + k to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dates = useMemo(() => {
    if (period === "custom") return [start, end];
    if (period === "quarter") {
      const qStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        .toISOString()
        .slice(0, 10);
      return [qStart, currentEnd];
    }
    if (period === "year") {
      return [`${year}-01-01`, `${year}-12-31`];
    }
    return [currentStart, currentEnd];
  }, [period, start, end, year, currentStart, currentEnd]);

  const rows = useMemo(() => {
    return filterTransactions(f.transactions, search, dates[0], dates[1], type).sort(
      (a: Transaction, b: Transaction) => b.date.localeCompare(a.date)
    );
  }, [f.transactions, search, dates, type]);

  const summary = useMemo(() => summarize(rows), [rows]);
  const balance = useMemo(() => summarize(f.transactions).balance, [f.transactions]);

  const spending = useMemo(() => {
    return categories
      .map((catName: string, i: number) => ({
        name: catName,
        value: budgetSpent(rows, catName),
        color: chartColors[i % chartColors.length],
      }))
      .filter((x: { name: string; value: number }) => x.value > 0)
      .sort((a: { name: string; value: number }, b: { name: string; value: number }) => b.value - a.value);
  }, [rows]);

  const flow = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const s = summarize(
        f.transactions.filter(
          (t: Transaction) =>
            t.date.startsWith(key) &&
            (!search ||
              `${t.description} ${t.category}`.toLowerCase().includes(search.toLowerCase())) &&
            (period === "month" || (t.date >= dates[0] && t.date <= dates[1]))
        )
      );
      return {
        name: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        income: s.income,
        expense: s.expense,
      };
    });
  }, [f.transactions, search, period, dates, year]);

  const name =
    f.user?.user_metadata?.full_name?.split(" ")[0] || f.user?.email?.split("@")[0] || "Daniel";

  function newTransaction() {
    setEditing(undefined);
    setModal(true);
  }

  function exportCsv() {
    const csv =
      "Descrição;Categoria;Data;Tipo;Valor;Status\n" +
      rows
        .map((t: Transaction) =>
          [t.description, t.category, t.date, t.type, t.amount, t.status]
            .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
            .join(";")
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `finova-extrato-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Extrato exportado em formato CSV!");
  }

  const budgets = f.goals.filter((g: Goal) => g.kind === "budget");
  const goals = f.goals.filter((g: Goal) => g.kind === "goal");

  return (
    <div className={`app-layout ${collapsed ? "is-collapsed" : ""}`}>
      {/* Mobile overlay */}
      {mobile && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <button
          onClick={() => {
            setCurrentView("overview");
            setMobile(false);
          }}
          className="brand"
        >
          <span className="brand-symbol">
            <ChartNoAxesCombined size={23} />
          </span>
          {!collapsed && (
            <span>
              finova<span className="brand-dot">.</span>
            </span>
          )}
        </button>

        <div className="sidebar-section">{!collapsed && "WORKSPACE"}</div>

        <nav>
          {navItems.map((n) => {
            const isActive = currentView === n.id;
            return (
              <Button
                key={n.id}
                variant="ghost"
                className={`nav-item ${isActive ? "active" : ""}`}
                title={n.label}
                onClick={() => {
                  setCurrentView(n.id);
                  setMobile(false);
                }}
              >
                <n.icon size={19} />
                {!collapsed && <span>{n.label}</span>}
              </Button>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="collapse-button"
          onClick={() => {
            setCollapsed(!collapsed);
            setMobile(false);
          }}
          title="Recolher navegação"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && "Recolher menu"}
        </Button>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="health-note">
              <span className="small-icon">
                <ShieldCheck size={21} />
              </span>
              <strong>Seu futuro, em boas mãos.</strong>
              <p>
                Mais clareza hoje.
                <br />
                Mais liberdade amanhã.
              </p>
              <span className="secure-label">
                <span />
                Conexão criptografada
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            className="nav-item help-item"
            onClick={() => setHelpModal(true)}
            title="Central de ajuda"
          >
            <HelpCircle size={18} />
            {!collapsed && <span>Central de ajuda</span>}
            {!collapsed && <ArrowUpRight size={14} className="ml-auto opacity-60" />}
          </Button>

          <div className="sidebar-footer">
            {!collapsed && (
              <>
                <span>finova © 2026</span>
                <span>v1.0 Pro</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="main-column">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Abrir navegação"
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <span className="breadcrumb">
              Workspace <ChevronRight size={13} />
              <span>
                {navItems.find((n) => n.id === currentView)?.label}
              </span>
            </span>
          </div>

          <div className="header-right">
            <label className="global-search">
              <Search size={17} />
              <input
                ref={searchInputRef}
                aria-label="Busca global"
                placeholder="Buscar transações, categorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="kbd-shortcut">⌘ K</span>
            </label>

            <Button
              variant="ghost"
              size="icon"
              title={f.light ? "Ativar modo escuro" : "Ativar modo claro"}
              aria-label="Alternar tema"
              onClick={() => f.setLight(!f.light)}
              className="theme-toggle"
            >
              {f.light ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notificações"
                  className="notification-icon"
                >
                  <Bell size={18} />
                  {rows.some((t: Transaction) => t.status === "pending") && <span className="notification-dot" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="notification-menu">
                <div className="notification-header">
                  <strong>Notificações</strong>
                  <span className="badge">
                    {rows.filter((t: Transaction) => t.status === "pending").length} pendente(s)
                  </span>
                </div>
                {rows.filter((t: Transaction) => t.status === "pending").length ? (
                  rows
                    .filter((t: Transaction) => t.status === "pending")
                    .map((t: Transaction) => (
                      <DropdownMenuItem
                        key={t.id}
                        onSelect={() => setCurrentView("transactions")}
                        className="notification-item"
                      >
                        <TriangleAlert className="text-amber-400 shrink-0" size={16} />
                        <div>
                          <strong className="block text-xs font-semibold">{t.description}</strong>
                          <span className="text-xs text-muted-foreground">
                            {money(t.amount)} · Pagamento pendente
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                ) : (
                  <p className="no-notifications">Nenhuma pendência recente.</p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="header-divider" />

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="account-trigger">
                  <span className="avatar">{name.slice(0, 2).toUpperCase()}</span>
                  <span className="account-name">
                    {name}
                    <small>{f.user ? "Conta Pessoal Pro" : "Modo Demonstração"}</small>
                  </span>
                  <ChevronDown size={14} className="opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="user-menu">
                <DropdownMenuItem
                  onSelect={() => {
                    setSettingsTab("Conta");
                    setCurrentView("settings");
                  }}
                >
                  <Settings size={16} />
                  Configurações de conta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSettingsTab("Segurança");
                    setCurrentView("settings");
                  }}
                >
                  <ShieldCheck size={16} />
                  Segurança & 2FA
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    f.resetToDefault();
                  }}
                >
                  <RotateCcw size={16} />
                  Restaurar dados demo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    if (onOpenAuth) onOpenAuth();
                    else f.setShowAuthScreen(true);
                  }}
                >
                  <User size={16} />
                  {f.user ? "Alternar ou Criar conta" : "Entrar ou Criar conta"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {f.user ? (
                  <DropdownMenuItem
                    onSelect={async () => {
                      await f.signOut();
                    }}
                    className="text-rose-400"
                  >
                    <LogOut size={16} />
                    Sair da conta
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => {
                      f.setShowAuthScreen(true);
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Entrar na minha conta
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Workspace body */}
        <main className="workspace">
          {/* Page Heading */}
          <div className="page-heading">
            <div>
              <div className="eyebrow">SEU DINHEIRO, SOB CONTROLE</div>
              <h1>
                {currentView === "overview"
                  ? `Olá, ${name}!`
                  : currentView === "chat"
                    ? "Assistente Bancário finova (MCP)"
                    : currentView === "transactions"
                      ? "Suas transações"
                      : currentView === "goals"
                        ? "Metas & orçamentos"
                        : currentView === "analysis"
                          ? "Análise financeira"
                          : "Configurações"}
                {currentView === "overview" && <span className="wave">👋</span>}
              </h1>
              <p>
                {currentView === "overview"
                  ? "Cada escolha de hoje constrói o seu amanhã. Veja seu panorama financeiro atualizado."
                  : currentView === "chat"
                    ? "Converse em português sobre contas, saldos e conceitos do Open Finance com dados alimentados via Model Context Protocol."
                    : currentView === "transactions"
                      ? "Todas as suas entradas, saídas e movimentações registradas."
                      : currentView === "goals"
                        ? "Transforme seus planos e metas em conquistas concretas."
                        : currentView === "analysis"
                          ? "Gráficos de fluxo de caixa, tendências e composição de despesas."
                          : "Personalize sua experiência, segurança e preferências no finova."}
              </p>
            </div>

            <div className="heading-actions">
              {currentView !== "chat" ? (
                <>
                  <Button variant="secondary" onClick={() => setCurrentView("chat")} className="gap-2">
                    <Bot size={16} />
                    Assistente MCP
                  </Button>
                  <Button variant="outline" onClick={exportCsv} className="export-btn">
                    <Download size={16} />
                    Exportar CSV
                  </Button>
                  <Button onClick={newTransaction} className="new-btn">
                    <Plus size={16} />
                    Nova transação
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setCurrentView("overview")}>
                    Voltar ao Dashboard
                  </Button>
                  <Button onClick={newTransaction} className="new-btn">
                    <Plus size={16} />
                    Nova transação
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Period selector & filter bar */}
          <div className="period-row">
            <div className="view-tabs">
              {currentView === "overview" ? (
                <>
                  <span className="selected">Visão geral</span>
                  <button
                    type="button"
                    className="view-tab-btn"
                    onClick={() => setCurrentView("analysis")}
                  >
                    Análise detalhada <ArrowUpRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="view-tab-btn"
                    onClick={() => setCurrentView("chat")}
                  >
                    Assistente MCP <Bot size={13} />
                  </button>
                </>
              ) : (
                <span className="selected">
                  {currentView === "chat"
                    ? "Assistente Conversacional MCP"
                    : currentView === "transactions"
                      ? "Todas as transações"
                      : currentView === "goals"
                        ? "Seus objetivos"
                        : currentView === "analysis"
                          ? "Fluxo & distribuição"
                          : "Minha conta"}
                </span>
              )}
            </div>

            <div className="period-controls">
              <span className="demo-label">
                <span className="pulse-indicator" />
                Demonstração Ativa
              </span>

              <div className="period-select-wrap">
                <CalendarDays size={15} />
                <select
                  aria-label="Período"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="month">Este mês</option>
                  <option value="quarter">Últimos 90 dias</option>
                  <option value="year">Este ano</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <span className="period-caption">
                {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {period === "custom" && (
            <div className="custom-dates">
              <label>
                De <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </label>
              <label>
                Até <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </label>
            </div>
          )}

          {/* CHAT VIEW (MCP ASSISTANT) */}
          {currentView === "chat" && <McpAssistant />}

          {/* STATS GRID (Overview & Analysis) */}
          {(currentView === "overview" || currentView === "analysis") && (
            <>
              <section className="stat-grid">
                {[
                  {
                    label: "Saldo total",
                    value: hidden ? "••••••••" : money(balance),
                    icon: Wallet,
                    klass: "balance-card",
                    caption: "Disponível em contas e investimentos",
                    color: "income",
                    sub: "Saldo consolidado",
                  },
                  {
                    label: "Receitas do mês",
                    value: money(summary.income),
                    icon: ArrowDownRight,
                    klass: "",
                    caption: "Entradas no período selecionado",
                    color: "income",
                    sub: `${rows.filter((t: Transaction) => t.type === "income").length} transações recebidas`,
                  },
                  {
                    label: "Despesas do mês",
                    value: money(summary.expense),
                    icon: ArrowUpRight,
                    klass: "",
                    caption: "Saídas no período selecionado",
                    color: "expense",
                    sub: `${rows.filter((t: Transaction) => t.type === "expense").length} pagamentos realizados`,
                  },
                  {
                    label: "Taxa de poupança",
                    value: `${summary.rate.toFixed(1).replace(".", ",")}%`,
                    icon: ChartNoAxesCombined,
                    klass: "",
                    caption: "Da sua receita líquida foi poupada",
                    color: "violet",
                    sub: summary.rate >= 20 ? "Acima da meta recomendada (20%)" : "Meta recomendada: 20%",
                  },
                ].map((s, i) => (
                  <motion.article
                    key={s.label}
                    className={`stat-card ${s.klass}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="stat-label">
                      <span>{s.label}</span>
                      <span className={`stat-icon ${s.color}`}>
                        <s.icon size={17} />
                      </span>
                    </div>

                    <div className="stat-value">
                      <span>{s.value}</span>
                      {i === 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Ocultar saldo"
                          onClick={() => setHidden(!hidden)}
                          className="hide-balance-btn"
                        >
                          {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      )}
                    </div>

                    <p>{s.caption}</p>

                    <div className={`stat-foot ${s.color}`}>
                      <span>
                        {i === 3 ? <Target size={13} /> : <ArrowUpRight size={13} />} {s.sub}
                      </span>
                      <svg viewBox="0 0 100 24" className="sparkline" aria-hidden="true">
                        <path
                          d={
                            i === 2
                              ? "M0 14 L10 12 L20 17 L30 9 L40 13 L50 6 L60 11 L70 4 L80 7 L90 2 L100 5"
                              : "M0 23 L10 18 L20 20 L30 14 L40 17 L50 9 L60 12 L70 6 L80 10 L90 3 L100 1"
                          }
                        />
                      </svg>
                    </div>
                  </motion.article>
                ))}
              </section>

              {/* CHARTS GRID */}
              <section className="chart-grid">
                {/* Cashflow Chart */}
                <article className="panel cashflow">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Fluxo de caixa <Info size={14} className="opacity-60 inline" />
                      </h2>
                      <p>Entradas e saídas consolidadas mês a mês</p>
                    </div>
                    <span className="chart-period">
                      Últimos 6 meses <ChevronDown size={13} />
                    </span>
                  </div>

                  <div className="chart-legend">
                    <span>
                      <i className="income-dot" />
                      Receitas
                    </span>
                    <span>
                      <i className="expense-dot" />
                      Despesas
                    </span>
                  </div>

                  <div className="area-chart">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart
                        data={flow}
                        margin={{ top: 12, right: 12, left: -14, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          stroke="rgba(255,255,255,0.07)"
                          strokeDasharray="3 5"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                          tickFormatter={(n) => `R$ ${n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            color: "var(--foreground)",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                          }}
                          formatter={(v: any, chartName: any) => [
                            money(Number(v) || 0),
                            chartName === "income" ? "Receitas" : "Despesas",
                          ] as any}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#income-fill)"
                        />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          stroke="#f43f5e"
                          strokeWidth={2.5}
                          fill="url(#expense-fill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-bottom">
                    <span>
                      <span className="status-dot" />
                      Seu saldo operacional no período está{" "}
                      <strong>{summary.balance >= 0 ? "positivo" : "negativo"}</strong>
                    </span>
                    <strong className={summary.balance >= 0 ? "income" : "expense"}>
                      {summary.balance >= 0 ? "+" : ""}
                      {money(summary.balance)}
                    </strong>
                  </div>
                </article>

                {/* Spending by Category Donut */}
                <article className="panel category-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Onde você gastou</h2>
                      <p>Distribuição de despesas por categoria</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Opções de categorias">
                          <Ellipsis size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setCurrentView("transactions")}>
                          Ver todas as transações
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setCurrentView("goals")}>
                          Ajustar orçamentos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={spending}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={68}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="none"
                          cornerRadius={4}
                        >
                          {spending.map((s: { name: string; value: number; color: string }, i: number) => (
                            <Cell key={s.name} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            color: "var(--foreground)",
                          }}
                          formatter={(v: any) => [
                            `${money(Number(v) || 0)} (${summary.expense ? ((Number(v) / summary.expense) * 100).toFixed(1) : 0}%)`,
                            "Total Gasto",
                          ] as any}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <span>Total despesas</span>
                      <strong>{money(summary.expense)}</strong>
                    </div>
                  </div>

                  <div className="category-list">
                    {spending.slice(0, 5).map((s: { name: string; value: number; color: string }, i: number) => (
                      <div key={s.name} className="category-row">
                        <span className="category-tag-name">
                          <i
                            className="category-dot"
                            style={{ backgroundColor: chartColors[i % chartColors.length] }}
                          />
                          {s.name}
                        </span>
                        <strong>{money(s.value)}</strong>
                        <small>
                          {summary.expense ? ((s.value / summary.expense) * 100).toFixed(0) : 0}%
                        </small>
                      </div>
                    ))}
                    {spending.length === 0 && (
                      <p className="no-expenses">Nenhuma despesa registrada neste período.</p>
                    )}
                  </div>
                </article>
              </section>
            </>
          )}

          {/* TRANSACTIONS TABLE (Overview & Transactions views) */}
          {(currentView === "overview" || currentView === "transactions") && (
            <section
              className={`lower-grid ${currentView === "transactions" ? "full-table" : ""}`}
            >
              <article className="panel transactions-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      {currentView === "overview" ? "Últimas movimentações" : "Histórico de transações"}
                      <span className="count-badge">{rows.length}</span>
                    </h2>
                    <p>
                      {currentView === "overview"
                        ? "Suas movimentações financeiras mais recentes"
                        : "Extrato completo de lançamentos e pagamentos"}
                    </p>
                  </div>

                  {currentView === "overview" ? (
                    <Button
                      variant="link"
                      onClick={() => setCurrentView("transactions")}
                      className="view-all-link"
                    >
                      Ver todas <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <div className="filter-controls">
                      <select
                        aria-label="Tipo de transação"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="type-select"
                      >
                        <option value="all">Todos os tipos</option>
                        <option value="income">Receitas (+)</option>
                        <option value="expense">Despesas (-)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, currentView === "overview" ? 6 : 100).map((t: Transaction) => {
                        const IconComp = icons[t.category] || Wallet;
                        return (
                          <tr key={t.id}>
                            <td>
                              <div className="tx-desc">
                                <span className={`tx-type-icon ${t.type}`}>
                                  <IconComp size={15} />
                                </span>
                                <div>
                                  <strong>{t.description}</strong>
                                  <small>{t.type === "income" ? "Receita creditada" : "Despesa debitada"}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="tag">{t.category}</span>
                            </td>
                            <td>
                              {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className={t.type === "income" ? "income" : "expense"}>
                              <strong>
                                {t.type === "income" ? "+" : "-"} {money(t.amount)}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-badge ${t.status}`}>
                                {t.status === "completed" ? "Concluído" : "Pendente"}
                              </span>
                            </td>
                            <td>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Ações da transação"
                                    className="action-btn"
                                  >
                                    <Ellipsis size={15} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setEditing(t);
                                      setModal(true);
                                    }}
                                  >
                                    <Pencil size={14} /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-400 hover:text-red-300"
                                    onSelect={() => {
                                      f.removeTransaction(t.id);
                                    }}
                                  >
                                    <Trash2 size={14} /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={6} className="empty-row">
                            <div className="empty-state">
                              <Wallet size={32} className="opacity-40 mb-2" />
                              <p>Nenhuma transação encontrada com os filtros atuais.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearch("");
                                  setType("all");
                                }}
                                className="mt-2"
                              >
                                Limpar filtros
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          )}

          {/* GOALS & BUDGETS VIEW */}
          {currentView === "goals" && (
            <section className="goals-section">
              <div className="panel-heading">
                <div>
                  <h2>Orçamentos do mês</h2>
                  <p>Acompanhe o teto de gastos estipulado para cada categoria</p>
                </div>
                <Button
                  onClick={() => {
                    setGoalEdit(undefined);
                    setGoalModal(true);
                  }}
                  className="new-btn"
                >
                  <Plus size={16} /> Novo orçamento / meta
                </Button>
              </div>

              <div className="goals-grid">
                {budgets.map((b) => {
                  const spent = budgetSpent(rows, b.name);
                  const pct = Math.min(100, (spent / b.target) * 100);
                  const isOver = spent > b.target;
                  return (
                    <article key={b.id} className="goal-card">
                      <div className="goal-header">
                        <div>
                          <strong>{b.name}</strong>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            Limite mensal planejado
                          </span>
                        </div>
                        <span className={isOver ? "expense font-bold" : "font-semibold"}>
                          {money(spent)} <span className="opacity-60 text-xs">/ {money(b.target)}</span>
                        </span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${isOver ? "over" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="goal-footer">
                        <small className={isOver ? "text-rose-400 font-semibold" : ""}>
                          {pct.toFixed(0)}% utilizado {isOver ? "(Orçamento estourado)" : ""}
                        </small>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setGoalEdit(b);
                              setGoalModal(true);
                            }}
                            title="Editar orçamento"
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              f.removeGoal(b.id);
                            }}
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Long-term goals */}
              <div className="panel-heading mt-10">
                <div>
                  <h2>Metas de longo prazo & Sonhos</h2>
                  <p>Planejamento para viagens, reservas de emergência e patrimônio</p>
                </div>
              </div>

              <div className="goals-grid">
                {goals.map((g) => {
                  const currentVal = g.current || g.saved || 0;
                  const pct = Math.min(100, (currentVal / g.target) * 100);
                  return (
                    <article key={g.id} className="goal-card image-card">
                      <div
                        className="goal-image"
                        style={{
                          backgroundImage: `url(${travel})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="goal-overlay" />
                        <div className="goal-content">
                          <strong>{g.name}</strong>
                          <span>
                            {money(currentVal)} acumulados de {money(g.target)}
                          </span>
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="goal-footer">
                        <small>{pct.toFixed(0)}% concluído</small>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setGoalEdit(g);
                              setGoalModal(true);
                            }}
                            title="Editar meta"
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              f.removeGoal(g.id);
                            }}
                            title="Excluir meta"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* SETTINGS VIEW */}
          {currentView === "settings" && (
            <section className="settings-section">
              <div className="settings-tabs">
                {["Conta", "Segurança", "Preferências"].map((tab) => (
                  <Button
                    key={tab}
                    variant={settingsTab === tab ? "default" : "ghost"}
                    onClick={() => setSettingsTab(tab)}
                    className="settings-tab-btn"
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {settingsTab === "Conta" && (
                <div className="panel settings-panel">
                  <h3>Informações do Perfil</h3>
                  <div className="settings-info-grid">
                    <div>
                      <span className="info-label">Nome completo</span>
                      <strong>{f.user?.user_metadata?.full_name || name}</strong>
                    </div>
                    <div>
                      <span className="info-label">E-mail de acesso</span>
                      <strong>{f.user?.email || "demonstracao@finova.app"}</strong>
                    </div>
                    <div>
                      <span className="info-label">Plano finova</span>
                      <strong className="text-emerald-400">Pro Lifetime Edition</strong>
                    </div>
                    <div>
                      <span className="info-label">Moeda padrão</span>
                      <strong>BRL (Real Brasileiro — R$)</strong>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3">
                    <Button
                      variant="default"
                      onClick={() => f.setShowAuthScreen(true)}
                    >
                      <User size={15} /> {f.user ? "Alternar ou Criar outra conta" : "Entrar ou Criar conta"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => f.resetToDefault()}
                    >
                      <RotateCcw size={15} /> Restaurar dados demo
                    </Button>
                  </div>
                </div>
              )}

              {settingsTab === "Segurança" && (
                <div className="panel settings-panel">
                  <h3>Segurança & Autenticação de Dois Fatores</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Proteja suas finanças com camadas adicionais de criptografia e biometria.
                  </p>
                  <div className="security-badges mt-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <ShieldCheck className="text-emerald-400" size={24} />
                      <div>
                        <strong>Criptografia ponta a ponta (AES-256)</strong>
                        <p className="text-xs text-muted-foreground">
                          Seus extratos e transações permanecem seguros e confidenciais.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                      <div>
                        <strong>Autenticação em duas etapas (2FA)</strong>
                        <p className="text-xs text-muted-foreground">
                          Ativa via app autenticador ou chave física FIDO2.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => toast.success("Configurações de segurança atualizadas!")}
                  >
                    Gerenciar chaves de segurança
                  </Button>
                </div>
              )}

              {settingsTab === "Preferências" && (
                <div className="panel settings-panel">
                  <h3>Preferências de Exibição & Tema</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tema atual selecionado:{" "}
                    <strong>{f.light ? "Claro (Light Mode)" : "Escuro (Dark Mode)"}</strong>
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant={!f.light ? "default" : "outline"}
                      onClick={() => f.setLight(false)}
                      className="gap-2"
                    >
                      <Moon size={16} /> Modo Escuro
                    </Button>
                    <Button
                      variant={f.light ? "default" : "outline"}
                      onClick={() => f.setLight(true)}
                      className="gap-2"
                    >
                      <Sun size={16} /> Modo Claro
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Modal: Nova / Editar Transação */}
        <Dialog open={modal} onOpenChange={setModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar transação" : "Nova transação"}</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da movimentação financeira no finova.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const data = {
                  description: String(form.get("description") || "").trim(),
                  category: String(form.get("category") || "Outros"),
                  amount: Math.abs(Number(form.get("amount") || 0)),
                  type: String(form.get("type") || "expense") as "income" | "expense",
                  date: String(form.get("date") || currentStart),
                  status: (String(form.get("status") || "completed") as "completed" | "pending"),
                };
                f.saveTransaction(data, editing?.id);
                setModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Descrição
                </label>
                <input
                  name="description"
                  defaultValue={editing?.description || ""}
                  required
                  className="form-input"
                  placeholder="Ex: Supermercado Pão de Açúcar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Valor (R$)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={editing?.amount || ""}
                    required
                    className="form-input"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tipo de lançamento
                  </label>
                  <select
                    name="type"
                    defaultValue={editing?.type || "expense"}
                    className="form-input"
                  >
                    <option value="expense">Despesa (-)</option>
                    <option value="income">Receita (+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Categoria
                  </label>
                  <select
                    name="category"
                    defaultValue={editing?.category || "Alimentação"}
                    className="form-input"
                  >
                    {categories.map((c: string) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Data
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={editing?.date || currentStart}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editing?.status || "completed"}
                  className="form-input"
                >
                  <option value="completed">Concluído (Liquidado)</option>
                  <option value="pending">Pendente (Agendado)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editing ? "Salvar alterações" : "Cadastrar transação"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Novo / Editar Orçamento ou Meta */}
        <Dialog open={goalModal} onOpenChange={setGoalModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {goalEdit ? "Editar Orçamento / Meta" : "Novo Orçamento ou Meta"}
              </DialogTitle>
              <DialogDescription>
                Defina um teto mensal para despesas ou uma meta de economia futura.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const kind = String(form.get("kind") || "budget") as "budget" | "goal";
                const target = Math.abs(Number(form.get("target") || 1000));
                const current = Math.abs(Number(form.get("current") || 0));
                const goalData = {
                  name: String(form.get("name") || "").trim(),
                  kind,
                  target,
                  current,
                  saved: current,
                };
                f.saveGoal(goalData, goalEdit?.id);
                setGoalModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Tipo
                </label>
                <select
                  name="kind"
                  defaultValue={goalEdit?.kind || "budget"}
                  className="form-input"
                >
                  <option value="budget">Orçamento Mensal (Ex: Alimentação, Lazer)</option>
                  <option value="goal">Meta de Longo Prazo (Ex: Viagem, Reserva)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Título / Categoria
                </label>
                <input
                  name="name"
                  defaultValue={goalEdit?.name || ""}
                  required
                  className="form-input"
                  placeholder="Ex: Alimentação ou Viagem Japão"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Valor Alvo (R$)
                  </label>
                  <input
                    name="target"
                    type="number"
                    step="0.01"
                    min="1"
                    defaultValue={goalEdit?.target || ""}
                    required
                    className="form-input"
                    placeholder="Ex: 2500,00"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Já acumulado (R$)
                  </label>
                  <input
                    name="current"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={goalEdit?.current || 0}
                    className="form-input"
                    placeholder="Ex: 500,00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setGoalModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Central de Ajuda */}
        <Dialog open={helpModal} onOpenChange={setHelpModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Central de Ajuda finova</DialogTitle>
              <DialogDescription>
                Dicas rápidas para aproveitar ao máximo seu painel financeiro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-sm text-foreground/80">
              <div className="rounded-xl p-3 bg-muted/40 border border-border">
                <strong className="text-foreground block mb-1">⌨️ Atalhos de teclado</strong>
                <p>Pressione <strong>⌘ K</strong> ou <strong>Ctrl + K</strong> em qualquer tela para focar na busca global instantânea.</p>
              </div>
              <div className="rounded-xl p-3 bg-muted/40 border border-border">
                <strong className="text-foreground block mb-1">📊 Gráficos Interativos</strong>
                <p>Passe o mouse sobre os pontos do fluxo de caixa e fatias da pizza para inspecionar percentuais e valores exatos.</p>
              </div>
              <div className="rounded-xl p-3 bg-muted/40 border border-border">
                <strong className="text-foreground block mb-1">📸 Pronto para Screenshots</strong>
                <p>Você pode ocultar o saldo clicando no ícone do olho na barra de métricas para fotos com privacidade ou exibição pública.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setHelpModal(false)}>Entendi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
