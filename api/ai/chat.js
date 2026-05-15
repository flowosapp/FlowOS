const GEMINI_KEY  = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash'

const SYSTEM_INSTRUCTION = `Você é o assistente de IA do FLOWOS, um sistema operacional de vida pessoal premium.
Sempre responda em português brasileiro.
Seja direto, específico e motivador. Nunca dê conselhos genéricos — use sempre os dados reais do usuário.
Quando o usuário perguntar algo, cite os nomes reais dos hábitos, tarefas, valores financeiros e metas dele.
Formate com markdown (negrito, listas) quando ajudar na leitura. Máximo 400 palavras.`

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

  const { messages, userContext } = req.body ?? {}
  if (!messages?.length) return res.status(400).json({ error: 'messages é obrigatório.' })

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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({ error: { message: geminiRes.statusText } }))
      return res.status(geminiRes.status).json({ error: err?.error?.message ?? 'Erro na API Gemini.' })
    }

    const data = await geminiRes.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    res.json({ content: text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
