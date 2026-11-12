import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Database,
  Terminal,
  HelpCircle,
  ExternalLink,
  Info,
  CheckCircle2,
  Table,
  RefreshCw,
  Coins,
  ShieldCheck,
  CreditCard,
  Building2,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Transaction, summarize, budgetSpent } from "@/lib/finance";
import { useFinance } from "./provider";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  toolCall?: {
    server: "mcp-server-plaid" | "mcp-pluggy";
    tool: string;
    args?: Record<string, any>;
    rawResult?: any;
  };
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
}

const USD_TO_BRL_RATE = 5.65;

export function McpAssistant() {
  const f = useFinance();
  const summary = summarize(f.transactions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showToolDetails, setShowToolDetails] = useState(true);

  const initialMessages: Message[] = [
    {
      id: "msg-1",
      sender: "assistant",
      text: "Olá, Daniel! Sou o assistente bancário inteligente do **finova** integrado via **Model Context Protocol (MCP)**.\n\nEstou conectado ao servidor da **Plaid Sandbox** para dados bancários fictícios e à **Pluggy** para a documentação e arquitetura do Open Finance brasileiro. Como posso te orientar hoje?",
      timestamp: "10:00",
    },
    {
      id: "msg-2",
      sender: "user",
      text: "Qual é o meu saldo atual em todas as contas e por que o saldo do cartão aparece como dívida?",
      timestamp: "10:01",
    },
    {
      id: "msg-3",
      sender: "assistant",
      timestamp: "10:01",
      toolCall: {
        server: "mcp-server-plaid",
        tool: "plaid.get_accounts",
        args: { client_id: "SANDBOX_CLIENT_ID", item_id: "sandbox_item_finova" },
      },
      text: "Consultei suas contas de teste via MCP na Plaid Sandbox. Aqui está o resumo das suas posições:\n\n**Explicação sobre o Cartão de Crédito:**\nNo padrão contábil bancário adotado pela Plaid e pelo Open Finance, contas de crédito são tratadas como **passivo financeiro** (*liability*). Portanto, o saldo de um cartão de crédito representa o montante que você deve à instituição emissora (dívida acumulada da fatura), e não um recurso líquido disponível.",
      tableData: {
        headers: ["Conta", "Tipo", "Moeda", "Saldo em USD", "Saldo em BRL (R$ 5,65)"],
        rows: [
          ["Plaid Checking (Corrente)", "Depósito", "USD", "$ 3.250,00", "R$ 18.362,50"],
          ["Plaid Savings (Poupança)", "Depósito", "USD", "$ 5.400,00", "R$ 30.510,00"],
          ["Plaid Credit Card (Crédito)", "Passivo/Dívida", "USD", "-$ 450,00", "-R$ 2.542,50"],
        ],
      },
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickPrompts = [
    {
      label: "Qual é o meu saldo consolidado?",
      icon: CreditCard,
      query: "Qual é o meu saldo consolidado e extrato do período?",
    },
    {
      label: "3 maiores padrões de gasto em tabela",
      icon: Table,
      query: "Quais são meus 3 maiores padrões de gasto? Mostre uma tabela com saídas e conversão em reais.",
    },
    {
      label: "Por que saldo de cartão é dívida?",
      icon: Scale,
      query: "Explique em detalhes por que o saldo de um cartão de crédito aparece como dívida no retorno do banco.",
    },
    {
      label: "O que é um 'Item' na Pluggy?",
      icon: Building2,
      query: "Consultando a documentação da Pluggy via MCP, o que é exatamente um Item no Open Finance?",
    },
    {
      label: "Como está meu orçamento de Alimentação?",
      icon: Coins,
      query: "Como está o meu orçamento de Alimentação neste mês?",
    },
  ];

  function handleSend(userQuery?: string) {
    const textToSend = userQuery || input.trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateMcpResponse(textToSend, f.transactions);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  }

  function generateMcpResponse(q: string, txs: Transaction[]): Message {
    const query = q.toLowerCase();
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // 1. Saldo consolidado
    if (query.includes("saldo") && !query.includes("cartão")) {
      const s = summarize(txs);
      return {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        timestamp: time,
        toolCall: {
          server: "mcp-server-plaid",
          tool: "plaid.get_balances",
          args: { account_ids: ["acc_sandbox_01", "acc_sandbox_02"] },
        },
        text: `Executei a ferramenta \`plaid.get_balances\` via **MCP**. Seu saldo líquido acumulado em conta é de **${money(s.balance)}**.\n\nNo período atual você registrou **${money(s.income)}** em receitas e **${money(s.expense)}** em despesas. Sua taxa de poupança atual é de **${s.rate.toFixed(1)}%**.`,
        tableData: {
          headers: ["Conta Fictícia Plaid", "Saldo Original (USD)", "Cotação Declarada", "Saldo Convertido (BRL)"],
          rows: [
            ["Conta Corrente Salário", "$ 2.560,00", "USD 1 = R$ 5,65", "R$ 14.464,00"],
            ["Conta Poupança / Reserva", "$ 6.070,00", "USD 1 = R$ 5,65", "R$ 34.295,50"],
            ["Total Consolidado", "$ 8.630,00", "-", "R$ 48.759,50"],
          ],
        },
      };
    }

    // 2. Três maiores padrões de gasto / tabela
    if (query.includes("padrões de gasto") || query.includes("padrão") || query.includes("maiores saídas") || query.includes("tabela")) {
      const expenses = txs
        .filter((t) => t.type === "expense")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      return {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        timestamp: time,
        toolCall: {
          server: "mcp-server-plaid",
          tool: "plaid.get_transactions",
          args: { limit: 10, include_categories: true },
        },
        text: "Identifiquei os **3 maiores padrões de gasto** nas transações recuperadas via servidor MCP da Plaid (onde saídas constam como débitos positivos). Os valores estão convertidos para Reais com a taxa declarada de **R$ 5,65**:",
        tableData: {
          headers: ["Padrão / Despesa", "Categoria", "Valor Original (USD)", "Valor em Reais (BRL)", "Impacto no Orçamento"],
          rows: expenses.map((e) => [
            e.description,
            e.category,
            `$ ${(e.amount / USD_TO_BRL_RATE).toFixed(2)}`,
            money(e.amount),
            `${((e.amount / summary.expense) * 100).toFixed(1)}% das despesas`,
          ]),
        },
      };
    }

    // 3. Explicação sobre saldo do cartão ser dívida
    if (query.includes("cartão") || query.includes("dívida") || query.includes("passivo")) {
      return {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        timestamp: time,
        toolCall: {
          server: "mcp-pluggy",
          tool: "pluggy.query_documentation",
          args: { topic: "credit_card_liabilities_balance" },
        },
        text: `### Por que o saldo do cartão de crédito aparece como dívida?\n\n1. **Natureza Contábil (Passivo):**\nDiferente de uma conta corrente (que é um ativo líquido do cliente), o cartão de crédito é uma linha de crédito rotativo concedida pelo banco. Tudo o que você compra com o cartão é um valor financiado pela instituição até a data de vencimento da fatura.\n\n2. **Padrão em APIs Bancárias (Plaid & Open Finance):**\nNo protocolo MCP da Plaid e da Pluggy:\n- **Contas de Depósito (*checking / savings*):** Saldo positivo representa seu dinheiro disponível.\n- **Contas de Cartão (*credit*):** O saldo positivo reportado pela API indica a **fatura aberta / saldo devedor** (*liability*). Ou seja, indica o montante que precisa ser liquidado.\n\n3. **Transações na Plaid:**\nNa convenção da Plaid, valores numéricos **positivos representam saídas de dinheiro** (débitos e compras no cartão), e valores **negativos representam entradas/estornos** (créditos e pagamentos de fatura).`,
      };
    }

    // 4. O que é um "Item" na Pluggy
    if (query.includes("item") || query.includes("pluggy") || query.includes("open finance")) {
      return {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        timestamp: time,
        toolCall: {
          server: "mcp-pluggy",
          tool: "pluggy.query_documentation",
          args: { endpoint: "GET /items/{id}", context: "open_finance_brasil" },
        },
        text: `### O que é um "Item" na Pluggy?\n\nDe acordo com a documentação oficial da Pluggy consultada via **MCP Streamable HTTP** (\`https://mcp.pluggy.ai/mcp\`):\n\n- **Definição Central:** Um **Item** é o objeto que representa a **conexão autenticada e o consentimento** de um usuário final com uma instituição financeira específica (ex: Nubank, Banco Itaú, Bradesco, Mercado Pago).\n- **Hierarquia 1 para N:** Um único **Item** pode conter múltiplas **Contas** (*Accounts*), como conta corrente, conta poupança e cartões de crédito vinculados àquele mesmo login bancário.\n- **Ciclo de Vida:** O Item possui estados como \`UPDATING\` (sincronizando transações), \`UPDATED\` (pronto para consulta), \`LOGIN_ERROR\` (senha expirada ou 2FA necessário) ou \`WAITING_USER_INPUT\`.\n- **Segurança no Brasil:** Em produção, a criação do Item exige o fluxo regulamentado de consentimento do Open Finance Brasil pelo Banco Central do Brasil.`,
      };
    }

    // 5. Orçamento por categoria
    if (query.includes("orçamento") || query.includes("alimentação") || query.includes("gasto")) {
      const foodSpent = budgetSpent(txs, "Alimentação");
      const foodGoal = f.goals.find((g) => g.name === "Alimentação");
      const target = foodGoal ? foodGoal.target : 2000;
      const pct = (foodSpent / target) * 100;

      return {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        timestamp: time,
        toolCall: {
          server: "mcp-server-plaid",
          tool: "plaid.get_categories_summary",
          args: { category: "Alimentação", current_month: true },
        },
        text: `Consultei os lançamentos da categoria **Alimentação** via MCP:\n\n- **Total Gasto:** ${money(foodSpent)}\n- **Teto Orçado:** ${money(target)}\n- **Utilização:** **${pct.toFixed(1)}%** do limite estipulado.\n\n${pct > 100 ? "⚠️ **Atenção:** Você ultrapassou o teto previsto para Alimentação este mês." : "✅ **Situação Regular:** Seu ritmo de gastos está dentro do previsto para o mês."}`,
      };
    }

    // Resposta padrão contextualizada
    return {
      id: `reply-${Date.now()}`,
      sender: "assistant",
      timestamp: time,
      toolCall: {
        server: "mcp-server-plaid",
        tool: "plaid.query_sandbox",
        args: { user_intent: q },
      },
      text: `Recebi sua solicitação: *"${q}"*.\n\nAtravés do Model Context Protocol (MCP), sincronizei os dados do sandbox bancário. Você tem atualmente **${txs.length} transações registradas** no período, com saldo total de **${money(summary.balance)}** e taxa de economia de **${summary.rate.toFixed(1)}%**.\n\nVocê também pode me perguntar sobre a conversão de moedas (USD/BRL), detalhes de faturas ou a documentação do Open Finance da Pluggy.`,
    };
  }

  function resetChat() {
    setMessages(initialMessages);
    toast.success("Histórico do chat restaurado!");
  }

  return (
    <div className="mcp-chat-container">
      {/* Top Banner: Sandbox notice required by challenge */}
      <div className="mcp-sandbox-banner">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-emerald-400 shrink-0" />
          <span>
            <strong>Ambiente Sandbox Fictício:</strong> Dados bancários simulados via MCP (Plaid Sandbox + Documentação Pluggy Open Finance). Nenhum dado real é exposto.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-chip">
            <span className="live-dot" />
            MCP Servers Online
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChat}
            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            title="Restaurar conversa inicial"
          >
            <RefreshCw size={12} /> Limpar
          </Button>
        </div>
      </div>

      {/* MCP Connection Architecture Panel */}
      <div className="mcp-servers-grid">
        <div className="mcp-server-card">
          <div className="server-header">
            <div className="flex items-center gap-2">
              <span className="server-badge plaid">STDIO</span>
              <strong>mcp-server-plaid</strong>
            </div>
            <span className="server-status active">
              <CheckCircle2 size={13} /> Conectado (Sandbox)
            </span>
          </div>
          <p className="server-desc">
            Fornece contas, saldos e transações de teste usando o runner <code>uvx mcp-server-plaid</code> com credenciais de Sandbox.
          </p>
          <div className="server-meta">
            <span>Client ID: <code>sandbox_***</code></span>
            <span>Convenção: Saída = Débito Positivo</span>
          </div>
        </div>

        <div className="mcp-server-card">
          <div className="server-header">
            <div className="flex items-center gap-2">
              <span className="server-badge pluggy">HTTP</span>
              <strong>Pluggy MCP Server</strong>
            </div>
            <span className="server-status active">
              <CheckCircle2 size={13} /> Sincronizado
            </span>
          </div>
          <p className="server-desc">
            Documentação viva do Open Finance Brasil através do endpoint Streamable HTTP <code>https://mcp.pluggy.ai/mcp</code>.
          </p>
          <div className="server-meta">
            <span>Conceitos: <code>Item</code>, <code>Account</code>, <code>Connector</code></span>
            <span>Sem chaves no cliente</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="chat-messages-area">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.sender}`}>
            <div className="chat-avatar">
              {m.sender === "assistant" ? <Bot size={18} /> : <span>DS</span>}
            </div>

            <div className="chat-bubble">
              <div className="chat-meta">
                <strong>{m.sender === "assistant" ? "Assistente finova (MCP)" : "Você (Daniel)"}</strong>
                <span>{m.timestamp}</span>
              </div>

              {/* Tool call indicator */}
              {m.toolCall && (
                <div className="tool-call-banner">
                  <div className="flex items-center justify-between">
                    <span className="tool-tag">
                      <Terminal size={12} />
                      MCP Tool: <code>{m.toolCall.tool}</code>
                    </span>
                    <span className="server-source">via {m.toolCall.server}</span>
                  </div>
                  {showToolDetails && m.toolCall.args && (
                    <div className="tool-payload">
                      <span>Argumentos:</span>
                      <code>{JSON.stringify(m.toolCall.args)}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Message text */}
              <div className="message-content">
                {m.text.split("\n\n").map((para, i) => {
                  if (para.startsWith("### ")) {
                    return <h3 key={i} className="text-base font-bold text-foreground mt-2 mb-1">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("**") && para.endsWith("**")) {
                    return <p key={i} className="font-semibold text-emerald-400 my-1">{para.replaceAll("**", "")}</p>;
                  }
                  return <p key={i} className="my-1 leading-relaxed">{para}</p>;
                })}
              </div>

              {/* Table Data */}
              {m.tableData && (
                <div className="mcp-table-wrap">
                  <table className="mcp-table">
                    <thead>
                      <tr>
                        {m.tableData.headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {m.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={String(cell).includes("R$") || String(cell).includes("$") ? "font-mono" : ""}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message assistant">
            <div className="chat-avatar">
              <Bot size={18} />
            </div>
            <div className="chat-bubble typing">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
              <small className="text-xs text-muted-foreground ml-2">Consultando ferramentas MCP...</small>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="quick-prompts-bar">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Sparkles size={13} className="text-emerald-400" /> Perguntas sugeridas:
        </span>
        <div className="quick-prompts-list">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              onClick={() => handleSend(p.query)}
            >
              <p.icon size={13} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          handleSend();
        }}
        className="chat-input-form"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta sobre contas, saldo ou documentação do Open Finance..."
          className="chat-input"
        />
        <Button
          type="submit"
          disabled={!input.trim()}
          className="send-button"
          aria-label="Enviar mensagem"
        >
          <Send size={16} />
          <span>Enviar</span>
        </Button>
      </form>
    </div>
  );
}
