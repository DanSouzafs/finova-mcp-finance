import { Bot, CheckCircle2, PlugZap, ServerCog, Wrench } from 'lucide-react';

const tools = [
  { name: 'plaid.get_accounts', status: 'online', summary: 'Consulta contas e saldos em tempo real' },
  { name: 'plaid.get_transactions', status: 'online', summary: 'Lista movimentos do mês e do período selecionado' },
  { name: 'pluggy.query_documentation', status: 'online', summary: 'Busca catálogo de regras e orçamentos' },
];

const conversation = [
  {
    role: 'assistant',
    text: 'Saldo consolidado atual: R$ 18.420,40. O patrimônio cresceu 8,4% em relação ao mês anterior.',
  },
  {
    role: 'user',
    text: 'Qual foi o impacto das despesas de viagem este mês?',
  },
  {
    role: 'assistant',
    text: 'As despesas com viagem totalizaram R$ 1.200,00, impactando 15,3% do orçamento de lazer e reduzindo a taxa de poupança para 28,4%.',
  },
];

export function McpAssistant() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Assistant</p>
            <h3 className="text-lg font-semibold text-white">MCP Finance Agent</h3>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </div>
      </div>

      <div className="space-y-3">
        {conversation.map((item, index) => (
          <div
            key={index}
            className={`rounded-2xl border p-3 text-sm ${
              item.role === 'assistant'
                ? 'border-emerald-500/15 bg-emerald-500/5 text-slate-100'
                : 'border-slate-700 bg-slate-900/60 text-slate-200'
            }`}
          >
            {item.text}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <ServerCog className="h-4 w-4 text-emerald-300" />
          Tooling status
        </div>

        <div className="space-y-2">
          {tools.map((tool) => (
            <div key={tool.name} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
              <div className="mt-0.5 rounded-full bg-slate-800 p-1.5 text-emerald-300">
                {tool.status === 'online' ? <PlugZap className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="font-medium text-white">{tool.name}</p>
                <p className="text-xs text-slate-400">{tool.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
