# 🎯 Quizzana

Plataforma web para **criação, execução, gerenciamento e análise de quizzes interativos**, desenvolvida como projeto da disciplina **Análise e Projeto de Sistemas (APS)** do curso de **Sistemas de Informação** da **UTFPR – Campus Campo Mourão**.

O **Quizzana** tem como objetivo apoiar processos educacionais e avaliativos por meio de uma aplicação web moderna, escalável e intuitiva, permitindo a interação em tempo real entre administradores (professores) e participantes (alunos).

---

## 📌 Contexto do Projeto

Este projeto foi desenvolvido como parte prática da disciplina de **Análise e Projeto de Sistemas**, com foco em:

- Levantamento e modelagem de requisitos
- Definição de casos de uso
- Organização da arquitetura do sistema
- Separação de responsabilidades entre frontend e backend
- Implementação de funcionalidades alinhadas aos requisitos funcionais e não funcionais

O sistema foi projetado visando **clareza estrutural**, **facilidade de manutenção** e **possibilidade de expansão futura**.

---

## 🧭 Visão Geral do Sistema

O **Quizzana** é uma aplicação web SPA (Single Page Application), desenvolvida com **React** e **Vite**, integrada ao **Supabase** como Backend as a Service (BaaS).

A plataforma permite:

- **Administradores / Professores**
  - Criar e gerenciar quizzes
  - Cadastrar e organizar questões
  - Criar salas de jogo
  - Acompanhar resultados e desempenho dos participantes

- **Participantes / Jogadores**
  - Entrar em salas por código
  - Responder perguntas em tempo real
  - Visualizar feedback e pontuação ao final do quiz

Todo o fluxo do sistema ocorre de forma centralizada, desde o cadastro das perguntas até a apresentação dos resultados finais.

---

## 🚀 Demo & Protótipo

- 🎨 **Protótipo de Interface (Figma)**  
  https://www.figma.com/design/1smsJGoTnLJPXJKn5HhUeS/Quizzana

- 📄 **Diagrama de Casos de Uso**  
  `documents/diagrama-de-casos-de-uso.drawio.png`

Esses materiais foram utilizados como base para a definição dos requisitos e da navegação do sistema.

---

## 🧩 Funcionalidades do Sistema

### 📝 Gerenciamento de Quizzes
- Criação de quizzes com título e descrição
- Edição e exclusão de quizzes existentes
- Controle de status (rascunho / publicado)
- Associação de questões a cada quiz

### 🧾 Banco de Questões
- Cadastro de questões objetivas
- Definição de alternativas
- Marcação da alternativa correta
- Organização das questões por categoria
- Reutilização de questões em diferentes quizzes

### 👥 Gerenciamento de Salas
- Criação de salas de jogo vinculadas a um quiz
- Geração de código único de acesso
- Entrada de jogadores por código
- Controle do início e encerramento da partida

### ⏱️ Execução do Quiz (Modo Jogador)
- Exibição de perguntas em tempo real
- Temporizador por questão
- Bloqueio de resposta ao término do tempo
- Avanço automático entre perguntas

### 📊 Resultados e Relatórios
- Cálculo automático de pontuação
- Exibição do ranking dos participantes
- Visualização de desempenho individual
- Base para análise pedagógica dos resultados

### 🔐 Autenticação e Controle de Acesso
- Autenticação de usuários com Supabase Auth
- Separação de perfis (administrador / jogador)
- Proteção de rotas administrativas

---

## ⚙️ Requisitos do Sistema

### ✅ Requisitos Funcionais (RF)
- RF01: Permitir o cadastro e autenticação de usuários
- RF02: Permitir a criação e edição de quizzes
- RF03: Permitir o cadastro de questões
- RF04: Permitir a criação de salas de jogo
- RF05: Permitir que jogadores entrem em salas por código
- RF06: Executar quizzes com temporizador
- RF07: Exibir pontuação e ranking ao final do jogo

### ⚠️ Requisitos Não Funcionais (RNF)
- RNF01: Interface intuitiva e responsiva
- RNF02: Persistência segura dos dados
- RNF03: Código modular e reutilizável
- RNF04: Boa performance em tempo real
- RNF05: Facilidade de manutenção e escalabilidade

---

## 🛠️ Tecnologias Utilizadas

### 🧑‍🎨 Frontend
- **React** — Biblioteca principal da interface
- **Vite** — Ferramenta de build e desenvolvimento
- **CSS** — Estilização dos componentes
- **ESLint** — Padronização e qualidade do código

### 🧑‍💻 Backend e Banco de Dados
- **Supabase**
  - Autenticação de usuários
  - Banco de dados PostgreSQL
  - Serviços de persistência e segurança

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura baseada em **componentização**, separando responsabilidades entre:

- **Páginas** — Estrutura principal das telas
- **Componentes reutilizáveis** — Inputs, botões, formulários, etc.
- **Serviços** — Comunicação com o Supabase
- **Camada de configuração** — Variáveis de ambiente e inicialização

Essa organização facilita a manutenção, leitura e expansão do sistema.

---

## 💻 Instalação e Execução (Local)

### 📋 Pré-requisitos
- Node.js (recomendado: **18+** ou **20**)
- npm ou yarn
- Conta e projeto configurado no Supabase

### 🛠️ Passo a Passo

1. Clone o repositório:
```bash
git clone <repo-url>
cd Quizzana/quizzana
