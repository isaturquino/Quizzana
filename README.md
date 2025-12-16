# 🎯 Quizzana

Plataforma web para **criação, execução e gerenciamento** de quizzes interativos, desenvolvida como projeto da disciplina **Análise e Projeto de Sistemas (APS)** da **UTFPR - Campus Campo Mourão**.

---

## 🧭 Visão Geral

O **Quizzana** permite que professores e administradores criem quizzes personalizados, gerenciem um banco de questões, controlem salas de jogo ao vivo e acompanhem o desempenho dos participantes em tempo real.

Principais pontos:

- Experiência de jogo em tempo real (sala de jogo / participante)
- Criação e edição de quizzes e questões
- Relatórios e pontuações para análise de desempenho
- Autenticação básica e gestão de usuários

---

## 🚀 Demo & Protótipo

- 🎨 Protótipo no Figma: https://www.figma.com/design/1smsJGoTnLJPXJKn5HhUeS/Quizzana
- 📄 Diagrama de casos de uso: `documents/diagrama-de-casos-de-uso.drawio.png`

---

## ✨ Recursos (Features)

- ✏️ Criar, editar e publicar quizzes
- 🧾 Banco de questões por categoria
- 👥 Gerenciar salas e jogadores (código de sala)
- ⏱️ Temporizador por questão (modo jogador)
- 📊 Relatórios e estatísticas de resultados
- 🔒 Autenticação com Supabase

---

## 🛠️ Tecnologias

- **Frontend:** React + Vite
- **Banco & Auth:** Supabase
- **UI:** CSS (componentes reutilizáveis)
- **Build / Dev:** Vite, ESLint

---

## ✅ Requisitos

- Node.js (recomendado: 18+; se tiver problemas, experimente Node 20)
- npm ou yarn
- Conta e projeto no Supabase (para fornecer URL e ANON KEY)

---

## 💻 Instalação e execução (local)

1. Clone o repositório:

```bash
git clone <repo-url>
cd Quizzana/quizzana
```

2. Instale dependências:

```bash
npm install
# ou
# yarn
```

3. Crie um arquivo `.env` na raiz do pacote `quizzana` com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=https://<your-supabase-url>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

> As variáveis acima são usadas em `src/services/supabase/supabaseClient.js` e são necessárias para conexão com o backend.

4. Rodar em desenvolvimento:

```bash
npm run dev
# Acesse http://localhost:5173
```

5. Build para produção:

```bash
npm run build
npm run preview
```

---

## 🧩 Scripts úteis

- `npm run dev` — inicia o servidor de desenvolvimento (Vite)
- `npm run build` — gera build de produção
- `npm run preview` — serve o build localmente
- `npm run lint` — executa o ESLint

---

## 🗂️ Estrutura do projeto (resumo)

- `src/` — código fonte do frontend (componentes, páginas, hooks)
- `src/services/supabase/` — integração com Supabase (serviços para quizzes, perguntas, salas, jogadores)
- `documents/` — materiais de projeto (diagramas, etc.)

---


Procure manter o padrão de código atual; se quiser, abra uma issue com a proposta antes de implementar.

---

## 👩‍💻 Desenvolvedoras

- **Isabely Turquino**
- **Yasmym Lemes**



