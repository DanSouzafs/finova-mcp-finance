# 💚 Finova — Gestão Financeira Pessoal & Assistente IA (MCP)

> Um aplicativo de gestão financeira moderno, responsivo e orientado a agentes inteligentes, construído com **React**, **Vite**, **Tailwind CSS**, **Recharts** e integração com **Model Context Protocol (MCP)**.

---

## 🌟 Sobre o Projeto

O **Finova** foi concebido para entregar clareza, velocidade e inteligência no controle de finanças pessoais. Desenvolvido com uma abordagem *dark-first*, ele combina visualização de dados em tempo real, relatórios de fluxo de caixa e um **Assistente IA nativo** com suporte a chamadas de ferramentas **MCP (Model Context Protocol)** para consulta e análise avançada de contas e transações.

---

## ✨ Principais Recursos

### 🤖 Assistente IA com MCP (Model Context Protocol)
- **Consulta Inteligente a Dados Bancários & Investimentos**: Execução de chamadas de ferramentas padronizadas (`plaid.get_transactions`, `plaid.get_accounts`, `pluggy.query_documentation`).
- **Transparência Total de Execução**: Exibição dos argumentos JSON, identificação do servidor MCP e status de conexão em tempo real.
- **Respostas Estruturadas & Análise**: Apresentação de dados em tabelas com conversão de câmbio automática (**USD ➔ BRL**) e cálculo de impacto sobre o orçamento.
- **Pedagogia Contábil**: Explicação em português do motivo pelo qual o saldo de cartão de crédito é tratado como passivo (*liability*) e convenções do Open Finance.

### 🌙 Design System & Dark Mode Native
- Interface elegante concebida prioritariamente em modo escuro, com tipografia **Plus Jakarta Sans**, acentos em verde esmeralda e paleta de alto contraste.
- Suporte a alternância rápida para modo claro (*Light Mode*).

### 👁️ Controle de Privacidade
- Botão de alternância para **ocultar/exibir saldo total**, ideal para apresentações, compartilhamento de tela ou screenshots em público.

### 📊 Métricas & KPIs em Tempo Real
- **Saldo consolidado acumulado** disponível em todas as contas.
- **Entradas e saídas do mês** atualizadas dinamicamente.
- **Taxa de poupança** com cálculo automático em relação à meta recomendada de 20%.
- **Sparklines em SVG** para visualização instantânea de tendências de fluxo.

### 📈 Visualização de Dados com Recharts
- **Fluxo de Caixa**: Gráfico de área em gradiente comparando receitas e despesas nos últimos 6 meses.
- **Distribuição de Despesas**: Gráfico em *donut* categorizando os gastos por percentual e valor absoluto.

### 💳 Gestão Completa de Transações
- Tabela com filtros por tipo (Receitas / Despesas), período e busca global em tempo real (atalho **⌘ K** ou **Ctrl + K**).
- Status de liquidação de pagamentos (Concluído ou Pendente).
- Modal para cadastro e edição de transações com sincronização imediata.
- **Exportação de extrato** completo em formato `.csv`.

### 🎯 Metas & Orçamentos
- Tetos de gastos mensais por categoria com alertas visuais de estouro de orçamento.
- Objetivos de longo prazo com acompanhamento visual de progresso e fotografias aspiracionais.

---

## 📸 Screenshots

| Tela | Prévia |
| :--- | :--- |
| **Visão Geral (Dashboard)** | ![Visão Geral (Dashboard)](./src/assets/travel-goal.jpg) |
| **Assistente IA (MCP - Transações & Análise)** | *Consulte contas, saldos e conversões USD ➔ BRL via MCP* |
| **Assistente IA (MCP - Saldos & Posição)** | *Status ativo dos servidores Plaid e Pluggy com tool calls* |
| **Histórico de Transações & Filtros** | *Extrato completo, status de liquidação e exportação CSV* |
| **Metas & Orçamentos** | *Tetos mensais por categoria e metas de longo prazo* |

> 💡 *Dica: Você pode adicionar as capturas de tela da sua aplicação diretamente na pasta `screenshots/` e referenciá-las nesta tabela.*

---

## 🛠️ Tech Stack

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Core** | React 19, TypeScript |
| **Build Tool** | Vite 8 |
| **Protocolo de IA** | Model Context Protocol (MCP) / Plaid MCP Server / Pluggy Open Finance |
| **Estilização** | Tailwind CSS v4, Lucide React Icons |
| **Visualização de Dados** | Recharts (AreaChart, PieChart) |
| **Gerenciamento de Estado** | React Context API & LocalStorage Engine |
| **Notificações & Feedback** | Sonner Toaster |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/finova.git
   cd finova
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador:**
   ```text
   http://localhost:3000/
   ```

---

## 📂 Estrutura do Projeto

```text
finova/
├── public/
├── src/
│   ├── assets/              # Imagens e recursos visuais (metas, badges)
│   ├── components/
│   │   ├── finance/
│   │   │   ├── mcp-assistant.tsx # Chat inteligente integrado ao Model Context Protocol
│   │   │   ├── provider.tsx      # Provedor de contexto e gerenciamento de estado
│   │   │   └── workspace.tsx     # Interface principal, Dashboard, extrato e metas
│   │   └── ui/                   # Componentes de UI reutilizáveis (Button, Dialog, Dropdown)
│   ├── lib/
│   │   ├── finance.ts       # Utilitários financeiros, cálculos e mock data dos servidores MCP
│   │   └── utils.ts         # Utilitários de classes e merge Tailwind
│   ├── App.tsx              # Componente Raiz da aplicação
│   ├── main.tsx             # Ponto de entrada do React
│   └── index.css            # Estilos globais, tema dark/light e Tailwind CSS
├── metadata.json            # Metadados da aplicação
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
└── vite.config.ts           # Configuração de build do Vite
```

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
