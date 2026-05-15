import { PublicShell } from '../../components/PublicShell'
import { ArrowRight } from 'lucide-react'

const grad = 'linear-gradient(135deg, #3b82f6, #06b6d4)'

const POSTS = [
  {
    tag: 'Produtividade', date: '10 mai 2026', read: '8 min',
    title: 'Como o Life Score mudou minha relação com hábitos em 30 dias',
    excerpt: 'Depois de 3 anos testando apps de hábitos, encontrei um padrão: todos eles tratam cada hábito como isolado. O FlowOS conecta os pontos — e os resultados são surpreendentes.',
    color: '#3b82f6',
  },
  {
    tag: 'IA & Comportamento', date: '5 mai 2026', read: '12 min',
    title: 'Por que sua IA pessoal precisa conhecer seu sono para entender sua produtividade',
    excerpt: 'Dados de 847 usuários revelam: pessoas que dormem menos de 6h têm, em média, 34% menos sessões de foco completadas no dia seguinte. A IA que ignora isso está trabalhando às cegas.',
    color: '#8b5cf6',
  },
  {
    tag: 'Finanças', date: '28 abr 2026', read: '6 min',
    title: 'Integrando metas financeiras com sua rotina diária: o modelo FlowOS',
    excerpt: 'Meta financeira não é planilha — é comportamento. Mostramos como o módulo de Finanças do FlowOS conecta gastos ao Life Score e cria responsabilidade real.',
    color: '#10b981',
  },
  {
    tag: 'Produto', date: '22 abr 2026', read: '4 min',
    title: 'Novo: Modo Foco com detecção de fadiga cognitiva',
    excerpt: 'Lançamos a nova versão do Modo Foco com um algoritmo que identifica quedas de atenção e sugere pausas estratégicas — reduzindo o tempo total necessário em até 22%.',
    color: '#06b6d4',
  },
  {
    tag: 'Filosofia', date: '15 abr 2026', read: '10 min',
    title: 'Operar sua vida como um sistema: a filosofia por trás do FlowOS',
    excerpt: 'Não existe paradoxo entre liberdade e estrutura. Os sistemas mais eficientes da natureza têm regras simples que geram comportamento complexo. Sua vida também pode ter isso.',
    color: '#f59e0b',
  },
  {
    tag: 'Pesquisa', date: '8 abr 2026', read: '15 min',
    title: 'O que 2.400 usuários ativos nos ensinaram sobre formação de hábitos',
    excerpt: 'Depois de analisar 2,4 milhões de registros de hábitos, encontramos os 3 fatores que separam usuários com streak de 60+ dias dos que abandonam na segunda semana.',
    color: '#ec4899',
  },
]

export default function BlogPage() {
  return (
    <PublicShell>
      <p className="pub-section-label">Blog</p>
      <h1 className="pub-h1">
        Ideias que movem<br />
        <span style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>o Life Score.</span>
      </h1>
      <p className="pub-body" style={{ maxWidth: 560, marginBottom: 64 }}>
        Pesquisa, produto e filosofia sobre performance pessoal, hábitos e o futuro da tecnologia de bem-estar.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {POSTS.map(({ tag, date, read, title, excerpt, color }) => (
          <article key={title} className="pub-card" style={{ cursor: 'pointer', transition: 'transform 0.3s, border-color 0.3s', display: 'flex', flexDirection: 'column', gap: 16 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = `${color}40` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 9px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{tag}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{read} de leitura</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.35, letterSpacing: '-0.015em' }}>{title}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 300, flex: 1 }}>{excerpt}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{date}</span>
              <ArrowRight size={14} color={color} />
            </div>
          </article>
        ))}
      </div>
    </PublicShell>
  )
}
