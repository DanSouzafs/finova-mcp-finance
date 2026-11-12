import { useState, type FormEvent } from "react";
import {
  ChartNoAxesCombined,
  ShieldCheck,
  Bot,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinance } from "./provider";
import { toast } from "sonner";

interface AuthProps {
  initialTab?: "signin" | "signup";
  onBackToApp?: () => void;
}

export function AuthScreen({ initialTab = "signin", onBackToApp }: AuthProps) {
  const f = useFinance();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState(tab === "signin" ? "daniel@finova.app" : "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("••••••••");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      f.signIn(email, password);
      setLoading(false);
      if (onBackToApp) onBackToApp();
    }, 400);
  }

  function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, informe seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, informe um e-mail válido.");
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Você precisa concordar com os Termos de Uso.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      f.signUp(name, email, password);
      setLoading(false);
      if (onBackToApp) onBackToApp();
    }, 450);
  }

  return (
    <div className="auth-container">
      {/* Top Navbar */}
      <header className="auth-topbar">
        <div className="brand cursor-pointer" onClick={() => onBackToApp && onBackToApp()}>
          <span className="brand-symbol">
            <ChartNoAxesCombined size={23} />
          </span>
          <span>
            finova<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            title={f.light ? "Ativar modo escuro" : "Ativar modo claro"}
            onClick={() => f.setLight(!f.light)}
            className="theme-toggle"
          >
            {f.light ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          {onBackToApp && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToApp}
              className="gap-1.5 text-xs h-8"
            >
              Continuar como visitante <ArrowRight size={13} />
            </Button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="auth-main-grid">
        {/* Left Side: Brand Value Proposition & Trust */}
        <section className="auth-hero-pane">
          <div className="auth-badge">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Gestão Financeira & Open Finance MCP</span>
          </div>

          <h1 className="auth-hero-title">
            Mais clareza hoje.
            <br />
            <span className="text-emerald-400">Mais liberdade amanhã.</span>
          </h1>

          <p className="auth-hero-desc">
            Organize despesas, acompanhe metas e consulte suas finanças em linguagem natural através do nosso assistente com Model Context Protocol (MCP).
          </p>

          <div className="auth-features-list">
            <div className="feature-item">
              <span className="feature-icon">
                <Bot size={18} />
              </span>
              <div>
                <strong>Assistente Bancário Inteligente</strong>
                <p>Respostas em português sobre saldos, transações e projeções de gastos.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <ShieldCheck size={18} />
              </span>
              <div>
                <strong>Segurança Bancária de Nível Institucional</strong>
                <p>Criptografia ponta a ponta e integração com padrões do Open Finance Brasil.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <strong>Controle Total de Orçamentos e Metas</strong>
                <p>Alertas de limites por categoria e acompanhamento de sonhos a longo prazo.</p>
              </div>
            </div>
          </div>

          <div className="auth-trust-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ambiente de Simulação
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs" />
                Open Finance Sandbox
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Conectado aos servidores MCP da Plaid (dados bancários fictícios) e Pluggy (documentação técnica).
            </p>
          </div>
        </section>

        {/* Right Side: Auth Card */}
        <section className="auth-form-pane">
          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${tab === "signin" ? "active" : ""}`}
                onClick={() => setTab("signin")}
              >
                Entrar na conta
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
                onClick={() => setTab("signup")}
              >
                Criar nova conta
              </button>
            </div>

            {/* Header info */}
            <div className="auth-card-header">
              <h2>{tab === "signin" ? "Acesse suas finanças" : "Comece gratuitamente"}</h2>
              <p>
                {tab === "signin"
                  ? "Informe suas credenciais ou entre em modo de demonstração."
                  : "Crie sua conta em segundos para gerenciar seus orçamentos."}
              </p>
            </div>

            {/* Form */}
            {tab === "signin" ? (
              <form onSubmit={handleSignIn} className="auth-form">
                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label>Senha</label>
                    <button
                      type="button"
                      className="text-xs text-emerald-500 hover:underline"
                      onClick={() => toast.info("Dica: Em ambiente de testes você pode usar qualquer senha ou o botão de demonstração rápida.")}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Alternar visibilidade da senha"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground my-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Lembrar meu acesso neste dispositivo
                  </label>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2 h-10 font-semibold">
                  {loading ? "Entrando..." : "Entrar no finova"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="auth-form">
                <div className="form-group">
                  <label>Nome completo</label>
                  <div className="input-wrap">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silva"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>E-mail de acesso</label>
                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label>Senha</label>
                    <div className="input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 dígitos"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirmar senha</label>
                    <div className="input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground my-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded accent-emerald-500 mt-0.5"
                    />
                    <span>
                      Concordo com os <strong>Termos de Uso</strong> e autorizo a simulação de Open Finance.
                    </span>
                  </label>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2 h-10 font-semibold">
                  {loading ? "Criando conta..." : "Criar minha conta"}
                </Button>
              </form>
            )}

            {/* Quick Demo Login Option */}
            <div className="auth-divider">
              <span>ou acesso rápido</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                f.signInDemo();
                if (onBackToApp) onBackToApp();
              }}
              className="w-full gap-2 border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 font-medium h-10"
            >
              <Zap size={16} className="text-emerald-400 fill-emerald-400/20" />
              <span>Entrar com Conta de Demonstração (Daniel Silva)</span>
            </Button>

            <p className="auth-footer-note">
              🔒 Seus dados permanecem criptografados e salvos localmente.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
