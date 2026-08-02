import type { Status, Confidence } from '../api'

interface Props {
  status: Status
  confidence: Confidence
}

const CONFIG = {
  GREEN:  { label: 'БЕЗПЕЧНО',    emoji: '🟢', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  YELLOW: { label: 'РИЗИК',       emoji: '🟡', color: '#b45309', bg: '#fefce8', border: '#fde047' },
  RED:    { label: 'НЕБЕЗПЕЧНО',  emoji: '🔴', color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' },
}

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  HIGH:   'Висока точність',
  MEDIUM: 'Середня точність',
  LOW:    'Низька точність',
}

export function StatusBadge({ status, confidence }: Props) {
  const cfg = CONFIG[status]
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderRadius: '999px',
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '1.1rem',
        letterSpacing: '0.05em',
      }}>
        {cfg.emoji} {cfg.label}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
        {CONFIDENCE_LABEL[confidence]}
      </span>
    </div>
  )
}
