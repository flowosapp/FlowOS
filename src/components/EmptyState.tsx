import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  emoji:       string
  titulo:      string
  descricao?:  string
  ctaLabel?:   string
  ctaIcon?:    ReactNode
  onCta?:      () => void
  compact?:    boolean
}

export default function EmptyState({
  emoji,
  titulo,
  descricao,
  ctaLabel,
  ctaIcon,
  onCta,
  compact = false,
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: compact ? '28px 20px' : '52px 24px',
      textAlign: 'center',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        fontSize: compact ? 36 : 48,
        marginBottom: compact ? 12 : 16,
        animation: 'float 3.5s ease-in-out infinite',
        lineHeight: 1,
      }}>
        {emoji}
      </div>

      <div style={{
        fontSize: compact ? 14 : 16,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginBottom: 8,
        color: 'var(--text-0)',
      }}>
        {titulo}
      </div>

      {descricao && (
        <p style={{
          fontSize: 13,
          color: 'var(--text-1)',
          lineHeight: 1.7,
          marginBottom: ctaLabel ? (compact ? 16 : 24) : 0,
          maxWidth: 300,
        }}>
          {descricao}
        </p>
      )}

      {ctaLabel && onCta && (
        <button
          className="btn-primary"
          onClick={onCta}
          style={{ gap: 7, fontSize: compact ? 13 : 13.5 }}
        >
          {ctaIcon ?? <Plus size={14} />}
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
