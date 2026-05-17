import { createClient } from '@supabase/supabase-js'

const GEMINI_KEY = process.env.GEMINI_API_KEY

const MODELS = {
  starter:  process.env.GEMINI_MODEL_STARTER  ?? 'gemini-2.0-flash',
  pro:      process.env.GEMINI_MODEL_PRO       ?? 'gemini-2.5-flash-preview-05-20',
  flowplus: process.env.GEMINI_MODEL_FLOWPLUS  ?? 'gemini-2.5-pro-preview-06-05',
}

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null

const SYSTEM_STARTER = `Você é o assistente de IA do FLOWOS, um sistema operacional de vida pessoal premium.
Sempre responda em português brasileiro.
Seja direto, específico e motivador. Nunca dê conselhos genéricos — use sempre os dados reais do usuário.
Quando o usuário perguntar algo, cite os nomes reais dos hábitos, tarefas, valores financeiros e metas dele.
Formate com markdown (negrito, listas) quando ajudar na leitura. Máximo 400 palavras.`

const SYSTEM_PRO = `${SYSTEM_STARTER}

Você está no modo PRO: faça análises mais profundas, identifique padrões entre hábitos e finanças,
sugira otimizações concretas baseadas nos dados. Pode usar até 600 palavras quando a análise justificar.`

const SYSTEM_FLOWPLUS = `Você é o assistente de IA premium do FLOWOS — Flow+.
Sempre responda em português brasileiro.
Você tem capacidades de raciocínio avançado. Use os dados completos do usuário para:
- Identificar correlações não óbvias (ex: produtividade cai quando sono < 7h E gastos sobem)
- Construir planos estratégicos de 30/60/90 dias com base nos padrões históricos
- Antecipar riscos (saúde, financeiros, produtividade) antes que aconteçam
- Sugerir experimentos mensuráveis para testar hipóteses sobre a vida do usuário
Cite sempre dados reais. Formate com markdown. Pode usar até 800 palavras quando necessário.`

function getSystemInstruction(plan) {
  if (plan === 'flowplus') return SYSTEM_FLOWPLUS
  if (plan === 'pro') return SYSTEM_PRO
  return SYSTEM_STARTER
}

function getModel(plan) {
  if (plan === 'flowplus') return MODELS.flowplus
  if (plan === 'pro') return MODELS.pro
  return MODELS.starter
}

async function getPlan(userId) {
  if (!supabase || !userId) return 'starter'
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return data?.plan ?? 'starter'
}

function buildContext(ctx) {
  if (!ctx) return null
  const hoje = new Date().toISOString().split('T')[0]
  const habitosFeitos = ctx.habitos?.filter(h => h.datasConcluidas?.includes(hoje)).length ?? 0
  const tarefasPendentes = ctx.tarefas?.filter(t => !t.concluida) ?? []
  const receitas = ctx.transacoes?.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0) ?? 0
  const gastos   = ctx.transacoes?.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0) ?? 0
  const fmtBRL   = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const habitosStr = ctx.habitos?.length
    ? ctx.habitos.slice(0, 10).map(h =>
        `  - ${h.icone} ${h.nome}: streak ${h.streak} dias, hoje=${h.datasConcluidas?.includes(hoje) ? 'feito' : 'pendente'}`
      ).join('\n')
    : '  - nenhum hábito cadastrado'

  const tarefasStr = tarefasPendentes.length
    ? tarefasPendentes.slice(0, 10).map(t => `  - [${t.prioridade}] ${t.titulo}`).join('\n')
    : '  - nenhuma tarefa pendente'

  const projetosStr = ctx.projetos?.filter(p => p.status === 'ativo').slice(0, 5)
    .map(p => `  - ${p.nome}`).join('\n') || '  - nenhum'

  const metasStr = ctx.metas?.filter(m => m.status === 'ativa').slice(0, 5)
    .map(m => `  - ${m.titulo} (${m.progresso}%, ${m.horizonte})`).join('\n') || '  - nenhuma'

  const sono = ctx.registrosSono?.slice(-1)[0]

  return `DADOS DO USUÁRIO NO FLOWOS (hoje: ${hoje}):
nome: ${ctx.perfil?.nome ?? 'não informado'}
objetivos: ${ctx.perfil?.objetivos?.join(', ') || 'não definidos'}
desafios: ${ctx.perfil?.desafios?.join(', ') || 'não definidos'}

hábitos (${ctx.habitos?.length ?? 0} total, ${habitosFeitos} feitos hoje):
${habitosStr}

tarefas pendentes (${tarefasPendentes.length}):
${tarefasStr}

projetos ativos:
${projetosStr}

finanças: receitas=${fmtBRL(receitas)}, gastos=${fmtBRL(gastos)}, saldo=${fmtBRL(receitas - gastos)}, poupança=${receitas > 0 ? Math.round(((receitas - gastos) / receitas) * 100) : 0}%

metas:
${metasStr}

sono: ${sono ? `${sono.horasDormidas}h (qualidade ${sono.qualidade}/5)` : 'sem dados'}
focos hoje: ${ctx.focosHoje ?? 0}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!GEMINI_KEY) return res.status(501).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { messages, userContext, userId } = req.body ?? {}
  if (!messages?.length) return res.status(400).json({ error: 'messages é obrigatório.' })

  // Verifica plano server-side (seguro — não confia no cliente)
  const plan = await getPlan(userId)
  const model = getModel(plan)
  const systemInstruction = getSystemInstruction(plan)

  const contextBlock = buildContext(userContext)

  const rawContents = messages.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const contents = rawContents.map((msg, i) => {
    if (i === 0 && msg.role === 'user' && contextBlock) {
      return { ...msg, parts: [{ text: `<flowos_context>\n${contextBlock}\n</flowos_context>\n\n${msg.parts[0].text}` }] }
    }
    return msg
  })

  const maxTokens = plan === 'flowplus' ? 2048 : plan === 'pro' ? 1536 : 1024

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({ error: { message: geminiRes.statusText } }))
      return res.status(geminiRes.status).json({ error: err?.error?.message ?? 'Erro na API Gemini.' })
    }

    const data = await geminiRes.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    res.json({ content: text, model, plan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
