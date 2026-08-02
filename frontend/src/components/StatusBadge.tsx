import type { Status, Confidence } from '../api'

interface Props {
  status: Status
  confidence: Confidence
}

const CONFIG: Record<Status, { label: string; color: string }> = {
  GREEN:  { label: 'БЕЗПЕЧНО',   color: 'var(--tally-green)' },
  YELLOW: { label: 'РИЗИК',      color: 'var(--tally-amber)' },
  RED:    { label: 'НЕБЕЗПЕЧНО', color: 'var(--tally-red)' },
}

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  HIGH:   'Висока точність',
  MEDIUM: 'Середня точність',
  LOW:    'Низька точність',
}

export function StatusBadge({ status, confidence }: Props) {
  const cfg = CONFIG[status]
  return (
    <div className="tally">
      <div
        className="tally__lamp"
        style={{ '--lamp-color': cfg.color } as React.CSSProperties}
        aria-hidden="true"
      />
      <div className="tally__word" style={{ '--lamp-word-color': cfg.color } as React.CSSProperties}>
        {cfg.label}
      </div>
      <div className="tally__confidence">{CONFIDENCE_LABEL[confidence]}</div>
    </div>
  )
}
