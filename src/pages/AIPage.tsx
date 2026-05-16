import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useFlowStore } from '../store'
import { Send, Sparkles, Trash2, Zap } from 'lucide-react'
import { track, Events } from '../services/analytics'

const API_URL = (import.meta.env.VITE_FLOWOS_API_URL as string | undefined) ?? ''

const SUGESTOES = [
  'Organize meu dia para máxima produtividade',
  'Analise minha situação financeira',
  'Me ajude a criar uma rotina matinal',
  'No que devo me focar esta semana?',
  'Revise minha consistência de hábitos',
  'Crie um desafio de 30 dias para mim',
]

function construirResposta(query: string, state: ReturnType<typeof useFlowStore.getState>): string {
  const q = query.toLowerCase()
  const hoje = new Date().toISOString().split('T')[0]
  const habitosFeitos = state.habitos.filter(h => h.datasConcluidas.includes(hoje)).length
  const tarefasPendentes = state.tarefas.filter(t => !t.concluida)
  const receitas = state.transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)
  const gastos = state.transacoes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0)
  const nome = state.perfil?.nome ?? 'você'
  const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (q.includes('organiz') || q.includes('dia') || q.includes('agenda')) {
    const tarefasAltas = tarefasPendentes.filter(t => t.prioridade === 'alta')
    const habitosPendentes = state.habitos.filter(h => !h.datasConcluidas.includes(hoje))
    return `Aqui está seu plano otimizado para hoje, ${nome}:

**🎯 Foco Principal (Manhã)**
${tarefasAltas.slice(0, 3).map((t, i) => `${i + 1}. ${t.titulo}`).join('\n') || '1. Definir a tarefa #1 do dia\n2. Bloquear 90 min para trabalho profundo\n3. Revisar metas e prioridades'}

**💪 Hábitos a Concluir (${state.habitos.length - habitosFeitos} restantes)**
${habitosPendentes.slice(0, 4).map(h => `• ${h.icone} ${h.nome}`).join('\n') || '• Todos os hábitos concluídos! Parabéns.'}

**⚡ Blocos de Tempo Sugeridos**
• 08:00 – 10:00 → Trabalho profundo (tarefas prioritárias)
• 10:00 – 10:30 → E-mails e comunicações
• 14:00 – 15:30 → Tarefas secundárias
• 18:00 → Revisão e planejamento do amanhã

Proteja suas manhãs — elas são seu tempo de maior alavancagem.`
  }

  if (q.includes('financ') || q.includes('dinheiro') || q.includes('orçamento') || q.includes('gaст') || q.includes('gasto')) {
    const saldo = receitas - gastos
    const taxaPoupanca = receitas > 0 ? Math.round((saldo / receitas) * 100) : 0
    const vencendo = state.transacoes.filter(t => {
      if (t.status === 'pago') return false
      const venc = new Date(t.dataVencimento)
      const diff = Math.ceil((venc.getTime() - Date.now()) / 86400000)
      return diff <= 7 && diff >= 0
    })
    return `**Análise Financeira de ${nome}**

📊 **Situação Atual**
• Total de Receitas: ${fmtBRL(receitas)}
• Total de Gastos: ${fmtBRL(gastos)}
• Saldo Líquido: ${saldo >= 0 ? '+' : ''}${fmtBRL(saldo)}
• Taxa de Poupança: ${taxaPoupanca}%
${vencendo.length > 0 ? `• ⚠️ ${vencendo.length} pagamento(s) vencem nos próximos 7 dias` : ''}

${taxaPoupanca >= 20
  ? '✅ Taxa de poupança excelente. Você está construindo momentum financeiro sólido.'
  : taxaPoupanca >= 10
    ? '⚡ Bom progresso. Mire 20%+ de taxa de poupança para acelerar a construção de riqueza.'
    : '⚠️ Foque em aumentar receitas ou reduzir gastos discricionários.'
}

**💡 Recomendações**
${saldo >= 0
  ? '1. Destine 50% das economias para investimentos\n2. Monte uma reserva de emergência de 3-6 meses\n3. Revise assinaturas para possíveis cortes'
  : '1. Identifique as 3 principais categorias de gasto para reduzir\n2. Explore uma nova fonte de renda\n3. Registre cada gasto por 30 dias'
}

Quer que eu crie um plano de orçamento detalhado ou uma estratégia de crescimento de renda?`
  }

  if (q.includes('hábito') || q.includes('habito') || q.includes('streak') || q.includes('consistênc') || q.includes('consistenc')) {
    const streakMedio = state.habitos.length > 0
      ? Math.round(state.habitos.reduce((s, h) => s + h.streak, 0) / state.habitos.length)
      : 0
    const melhorHabito = [...state.habitos].sort((a, b) => b.streak - a.streak)[0]
    return `**Relatório de Consistência de Hábitos**

📈 **Status Atual**
• Hábitos Ativos: ${state.habitos.length}
• Concluídos Hoje: ${habitosFeitos}/${state.habitos.length}
• Streak Médio: ${streakMedio} dias
${melhorHabito ? `• Melhor Streak: ${melhorHabito.icone} ${melhorHabito.nome} (${melhorHabito.streak} dias)` : ''}

${state.habitos.length === 0
  ? '**Primeiros Passos**\nAdicione seus primeiros hábitos na seção Hábitos. Comece com apenas 2-3 para evitar sobrecarga.'
  : streakMedio >= 7
    ? '**Análise**\nVocê está em um groove de consistência forte. Hábitos com 7+ dias de streak começam a se tornar automáticos. Continue protegendo sua rotina.'
    : '**Análise**\nStreaks abaixo de 7 dias ainda são frágeis. Foque em tornar cada hábito o mais fácil possível de executar. Os primeiros 21 dias são críticos.'
}

**💡 Sugestão de Stack de Hábitos**
Encadeie seus hábitos em sequência: Acordar → Água → ${state.habitos[0]?.nome ?? 'Exercício'} → ${state.habitos[1]?.nome ?? 'Journaling'} → Trabalho profundo. Isso reduz drasticamente a fadiga de decisão.`
  }

  if (q.includes('foco') || q.includes('produtividade') || q.includes('trabalho profundo') || q.includes('concentr')) {
    return `**Estratégia de Trabalho Profundo para ${nome}**

🧠 **O Protocolo de Foco FLOWOS**

**Fase 1: Preparação do Ambiente (5 min)**
• Feche todas as notificações
• Escreva a intenção: qual é o UNO que você vai resolver?
• Abra o Modo Foco no FLOWOS

**Fase 2: Sessão de Trabalho Profundo (25-90 min)**
• Apenas uma tarefa por vez — zero multitarefa
• Se distrair, anote e volte à tarefa
• ${tarefasPendentes.length > 0 ? `Comece com: "${tarefasPendentes[0].titulo}"` : 'Comece com o trabalho mais criativo e de maior valor'}

**Fase 3: Revisão (5 min)**
• Marque o que foi feito
• Anote o momentum e os bloqueios
• Agende a próxima sessão

⚡ **Seu Estado Atual**
• ${state.focosHoje} sessões de foco concluídas hoje
• ${tarefasPendentes.length} tarefas aguardando atenção

3-4 sessões focadas por dia = mais produção do que um dia inteiro sem foco.`
  }

  if (q.includes('semana') || q.includes('plano') || q.includes('prioridade') || q.includes('focar')) {
    const objetivos = state.perfil?.objetivos ?? []
    return `**Plano de Prioridades da Semana**

🎯 **Suas Áreas de Foco**
${objetivos.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join('\n') || '1. Defina suas 3 prioridades máximas\n2. Revise projetos em andamento\n3. Estabeleça intenções semanais'}

**📋 Ações Recomendadas**
${tarefasPendentes.slice(0, 5).map((t, i) => `${i + 1}. ${t.titulo} [${t.prioridade}]`).join('\n') || 'Nenhuma tarefa ainda — adicione tarefas na seção Projetos'}

**🔑 Não-Negociáveis desta Semana**
• Completar ${state.habitos.length > 0 ? 'todos os hábitos diários (especialmente no início da semana)' : 'configurar seu sistema de hábitos'}
• Revisar finanças todo domingo
• Pelo menos um bloco de trabalho profundo por dia

Foque no progresso, não na perfeição. O que importa é aparecer de forma consistente.`
  }

  if (q.includes('rotina') || q.includes('manhã') || q.includes('manha') || q.includes('matin') || q.includes('acordar')) {
    return `**A Rotina Matinal Perfeita**

⏰ **Protocolo Matinal FLOWOS (60 min)**

**06:00 – 06:10** Hidrate + sem celular
Sem redes sociais nos primeiros 60 minutos. Seu primeiro input molda seu estado mental.

**06:10 – 06:25** Movimento
Caminhada, exercício ou alongamento. Ativa o corpo e aguça o foco.

**06:25 – 06:35** Journaling (10 min)
Escreva: Pelo que sou grato? O que tornaria este dia excelente? Alguma preocupação para liberar?

**06:35 – 06:50** Revisão de prioridades
Abra o FLOWOS → Verifique suas tarefas → Defina o objetivo #1 de hoje.

**06:50 – 07:00** Preparação para trabalho profundo
Prepare o café. Limpe a mesa. Feche tudo exceto o seu trabalho.

**O efeito composto:** Esta rotina, feita 200 dias por ano, gera 200 manhãs intencionais. Essa é a diferença entre o mediano e o extraordinário.

Quer que eu adapte isso ao seu horário específico?`
  }

  if (q.includes('desafio') || q.includes('30 dias') || q.includes('30dias') || q.includes('challenge')) {
    const objetivo = state.perfil?.objetivos?.[0] ?? 'seu objetivo principal'
    return `**Desafio de 30 Dias — ${objetivo}**

🚀 **O Programa**

**Semana 1: Fundação (Dias 1-7)**
Construa momentum com pequenas vitórias. Não tente ser perfeito — apenas apareça.
• Dias 1-3: Estabeleça a sequência de hábitos matinais
• Dias 4-7: Adicione um novo hábito por dia

**Semana 2: Intensidade (Dias 8-14)**
Empurre levemente além da zona de conforto. É aqui que a mudança real começa.
• Dobre os blocos de trabalho profundo
• Elimine um grande destruidor de tempo

**Semana 3: Consolidação (Dias 15-21)**
O marco dos 21 dias — os hábitos começam a se sentir automáticos.
• Revise o que funciona, corte o que não funciona
• Compartilhe o progresso (responsabilidade)

**Semana 4: Integração (Dias 22-30)**
Você não está mais lutando pela disciplina. Você está rodando um sistema.
• Meça o progresso vs. Dia 1
• Planeje o Mês 2

**📊 Métricas de Sucesso**
Acompanhe diariamente no FLOWOS: hábitos concluídos, tarefas feitas, nível de energia (1-10).

Comece o Dia 1 amanhã. Não semana que vem. Amanhã.`
  }

  // Resposta genérica
  return `Sou sua IA integrada ao FLOWOS. Aqui está um resumo do seu sistema:

**📊 Visão Geral**
• Hábitos: ${state.habitos.length} configurados, ${habitosFeitos} concluídos hoje
• Tarefas: ${tarefasPendentes.length} pendentes
• Finanças: ${state.transacoes.filter(t => t.status === 'pendente').length} pagamentos pendentes

**💡 O que posso fazer por você:**
• Organizar seu dia e prioridades
• Analisar seus padrões financeiros
• Construir rotinas e desafios personalizados
• Revisar consistência de hábitos
• Criar estratégias de foco e produtividade
• Gerar planos semanais

**Experimente perguntar:**
• "Organize meu dia para máxima produtividade"
• "No que devo me focar esta semana?"
• "Analise minha situação financeira"
• "Crie uma rotina matinal para mim"

Estou aqui para te ajudar a rodar sua vida como um sistema.`
}

export default function AIPage() {
  const mensagens = useFlowStore(s => s.mensagens)
  const adicionarMensagem = useFlowStore(s => s.adicionarMensagem)
  const limparMensagens = useFlowStore(s => s.limparMensagens)
  const perfil = useFlowStore(s => s.perfil)

  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar(query?: string) {
    const q = (query ?? input).trim()
    if (!q || carregando) return

    track(Events.AI_MESSAGE_SENT)
    const historicoPrevio = [...mensagens]
    setInput('')
    adicionarMensagem('usuario', q)
    setCarregando(true)

    const state = useFlowStore.getState()
    let resposta: string | null = null

    if (API_URL) {
      try {
        const apiMessages = [
          ...historicoPrevio.map(m => ({
            role: m.papel === 'usuario' ? 'user' : 'assistant',
            content: m.conteudo,
          })),
          { role: 'user', content: q },
        ]

        const userContext = {
          perfil: state.perfil,
          isPro: state.isPro,
          habitos: state.habitos,
          tarefas: state.tarefas,
          projetos: state.projetos,
          transacoes: state.transacoes,
          focosHoje: state.focosHoje,
          registrosSaude: state.registrosSaude,
          registrosSono: state.registrosSono,
          metas: state.metas,
        }

        const res = await fetch(`${API_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, userContext }),
        })

        if (res.ok) {
          const data = await res.json() as { content: string }
          resposta = data.content
        }
      } catch {
        // fall through to local
      }
    }

    if (!resposta) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600))
      resposta = construirResposta(q, state)
    }

    adicionarMensagem('assistente', resposta)
    setCarregando(false)
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '20px 32px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Sparkles size={18} color="var(--purple)" />
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Central de IA</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Inteligência contextual para o seu sistema de vida</p>
        </div>
        {mensagens.length > 0 && (
          <button className="btn-ghost" onClick={limparMensagens} style={{ gap: 6, fontSize: 13, padding: '7px 12px' }}>
            <Trash2 size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* Mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mensagens.length === 0 && (
          <div className="animate-in">
            <div style={{ textAlign: 'center', marginBottom: 36, paddingTop: 20 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(139,92,246,0.25)' }}>
                <Sparkles size={28} color="#fff" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Como posso te ajudar{perfil?.nome ? `, ${perfil.nome}` : ''}?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto' }}>
                Tenho contexto completo dos seus hábitos, tarefas, projetos e finanças. Pergunte qualquer coisa.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 640, margin: '0 auto' }}>
              {SUGESTOES.map(s => (
                <button key={s} onClick={() => enviar(s)}
                  style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(139,92,246,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                  <Zap size={13} color="var(--purple)" strokeWidth={2} style={{ flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.papel === 'usuario' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {m.papel === 'assistente' && (
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
                <Sparkles size={14} color="#fff" />
              </div>
            )}
            <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: m.papel === 'usuario' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.papel === 'usuario' ? 'var(--accent)' : 'var(--bg-surface)', border: m.papel === 'usuario' ? 'none' : '1px solid var(--border)', fontSize: 14, lineHeight: 1.65, color: m.papel === 'usuario' ? '#fff' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {m.conteudo}
            </div>
          </div>
        ))}

        {carregando && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', animation: `pulse 1.2s ease infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 32px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '10px 14px', transition: 'border-color 0.15s' }}
          onFocusCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-accent)')}
          onBlurCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pergunte qualquer coisa... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, resize: 'none', lineHeight: 1.5, maxHeight: 120, overflow: 'auto' }}
          />
          <button onClick={() => enviar()} disabled={!input.trim() || carregando}
            style={{ width: 36, height: 36, background: input.trim() && !carregando ? 'var(--accent)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, cursor: input.trim() && !carregando ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', alignSelf: 'flex-end' }}>
            <Send size={15} color={input.trim() && !carregando ? '#fff' : 'var(--text-dim)'} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
          {API_URL ? 'Powered by Gemini · contexto completo do seu FLOWOS' : 'A IA do FLOWOS conhece seus hábitos, tarefas, projetos e finanças.'}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
