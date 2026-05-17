# FlowOS — Descrições dos Produtos (Stripe + Marketing)

---

## STARTER — R$29/mês · $9/mo

### Nome do produto (Stripe)
`FlowOS Starter`

### Descrição curta (Stripe — aparece no checkout, max ~120 chars)
**PT-BR:**
> Sistema operacional de vida com hábitos, tarefas, foco e coaching por IA. 15 dias grátis.

**EN:**
> Life operating system with habits, tasks, focus sessions and AI coaching. 15-day free trial.

### Descrição longa (Product Hunt, landing page, email)
**PT-BR:**
> O FlowOS Starter te dá tudo que você precisa para construir consistência real. Acompanhe seus hábitos diários com streak automático, organize tarefas por prioridade, entre no Modo Foco com timer Pomodoro, e tenha um coach de IA disponível 24h. Tudo em um único lugar, com visual limpo e sem distrações. Experimente grátis por 15 dias — cancele quando quiser.

**EN:**
> FlowOS Starter gives you everything you need to build real consistency. Track your daily habits with automatic streaks, organize tasks by priority, enter Focus Mode with a Pomodoro timer, and have an AI coach available 24/7 — all in one place, with a clean interface and zero distractions. Try free for 15 days, cancel anytime.

### O que está incluído
- ✅ Rastreamento de hábitos (streak + histórico 84 dias)
- ✅ Tarefas e projetos
- ✅ Modo Foco (Pomodoro)
- ✅ Coach IA (50 msg/mês)
- ✅ Life Score diário
- ✅ Dashboard personalizado
- ✅ Apps iOS + Android (PWA)
- ✅ **15 dias de trial gratuito**

---

## PRO — R$49/mês · $19/mo

### Nome do produto (Stripe)
`FlowOS Pro`

### Descrição curta (Stripe)
**PT-BR:**
> Tudo do Starter + IA ilimitada, finanças completas, saúde e analytics avançados.

**EN:**
> Everything in Starter + unlimited AI, full finance tracking, health module and advanced analytics.

### Descrição longa
**PT-BR:**
> O FlowOS Pro é para quem leva performance a sério. IA ilimitada para coaching, planejamento e análise estratégica. Controle financeiro completo com categorias, carteiras e tags. Módulo de saúde com treinos, sono e humor. Analytics avançados com gráficos de tendência e insights automáticos baseados no seu comportamento. O seu sistema operacional de vida no nível profissional.

**EN:**
> FlowOS Pro is for those who take performance seriously. Unlimited AI for coaching, planning, and strategic analysis. Complete financial control with categories, wallets, and tags. Health module with workouts, sleep, and mood tracking. Advanced analytics with trend charts and automatic insights based on your behavior. Your life operating system at the professional level.

### O que está incluído
- ✅ Tudo do Starter
- ✅ Coach IA **ilimitado**
- ✅ Finanças completas (contas, categorias, tags, parcelas)
- ✅ Módulo de Saúde (treinos, sono, humor, energia)
- ✅ Metas com marcos e progresso
- ✅ Crescimento pessoal (projetos, journaling)
- ✅ Analytics avançados + insights automáticos
- ✅ Exportação de dados
- ✅ Suporte prioritário

---

## FLOW+ — R$129/mês · $49/mo

### Nome do produto (Stripe)
`FlowOS Flow+`

### Descrição curta (Stripe)
**PT-BR:**
> Sistema completo para alta performance com suporte VIP, onboarding dedicado e todos os recursos ilimitados.

**EN:**
> Complete high-performance system with VIP support, dedicated onboarding and all features unlimited.

### Descrição longa
**PT-BR:**
> O Flow+ é o FlowOS no seu máximo. Onboarding personalizado 1:1 com a equipe, suporte VIP com resposta em 24h, acesso antecipado a todos os novos recursos e integrações futuras. Ideal para founders, coaches e profissionais que precisam do sistema mais completo para gerir sua vida e negócio. Entre em contato para começar.

**EN:**
> Flow+ is FlowOS at its maximum. Personalized 1:1 onboarding with the team, VIP support with 24h response, early access to all new features and future integrations. Ideal for founders, coaches, and professionals who need the most complete system to manage their life and business. Contact us to get started.

### O que está incluído
- ✅ Tudo do Pro
- ✅ Onboarding 1:1 com a equipe FlowOS
- ✅ Suporte VIP (resposta em até 24h)
- ✅ Acesso antecipado a novos recursos
- ✅ Integrações futuras (Google Calendar, Notion, etc.)
- ✅ API access (roadmap)
- ✅ Relatórios personalizados

---

## Metadados para o Stripe

| Campo              | Starter          | Pro              | Flow+              |
|--------------------|------------------|------------------|--------------------|
| Product name       | FlowOS Starter   | FlowOS Pro       | FlowOS Flow+       |
| Statement desc.    | FlowOS Starter   | FlowOS Pro       | FlowOS Flow+       |
| Tax category       | Software (SaaS)  | Software (SaaS)  | Software (SaaS)    |
| Trial (PT-BR)      | 15 dias          | —                | —                  |
| Trial (USD)        | 15 days          | —                | —                  |
| BRL price          | R$29,00          | R$49,00          | R$129,00           |
| USD price          | $9.00            | $19.00           | $49.00             |
| Billing interval   | Monthly          | Monthly          | Monthly            |

---

## Checklist de criação no Stripe

- [ ] Criar produto **FlowOS Starter** → adicionar price BRL R$29 + price USD $9 (trial 15 dias em ambos)
- [ ] Criar produto **FlowOS Pro** → adicionar price BRL R$49 + price USD $19
- [ ] Criar produto **FlowOS Flow+** → adicionar price BRL R$129 + price USD $49
- [ ] Copiar Price IDs e adicionar em Vercel:
  - `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_STARTER_USD`
  - `STRIPE_PRICE_PRO` / `STRIPE_PRICE_PRO_USD`
  - `STRIPE_PRICE_FLOWPLUS` / `STRIPE_PRICE_FLOWPLUS_USD`
- [ ] Fazer upload das imagens SVG/PNG para cada produto
- [ ] Redeploy Vercel após adicionar as vars
