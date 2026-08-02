import type { CheckResult, Status } from '../api'
import { StatusBadge } from './StatusBadge'

interface Props {
  result: CheckResult
}

const BORDER_COLOR: Record<Status, string> = {
  GREEN:  '#22c55e',
  YELLOW: '#eab308',
  RED:    '#ef4444',
}

const BG_COLOR: Record<Status, string> = {
  GREEN:  '#f0fdf4',
  YELLOW: '#fefce8',
  RED:    '#fef2f2',
}

function Row({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: '#1f2937', lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  )
}

export function ResultCard({ result }: Props) {
  const { status, confidence, track, live_verdict, vod_verdict, checked_at, disclaimer } = result
  const checkedDate = new Date(checked_at).toLocaleString('uk-UA')

  return (
    <div style={{
      borderRadius: '12px',
      border: `1px solid ${BORDER_COLOR[status]}`,
      borderLeft: `5px solid ${BORDER_COLOR[status]}`,
      background: BG_COLOR[status],
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <StatusBadge status={status} confidence={confidence} />

        {track.recognized && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>
              {track.title ?? '—'}
              {track.artist && <span style={{ fontWeight: 400, color: '#6b7280' }}> — {track.artist}</span>}
            </div>
            {track.label && (
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '2px' }}>
                Лейбл: {track.label}
                {track.release_date && ` · ${track.release_date}`}
              </div>
            )}
          </div>
        )}

        {!track.recognized && (
          <div style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
            Трек не розпізнано в базах
          </div>
        )}
      </div>

      {/* Verdicts */}
      <Row icon="📡" label="Під час стріму (live)" text={live_verdict} />
      <Row icon="🗂️" label="Запис після стріму (VOD)" text={vod_verdict} />

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #e5e7eb',
        background: 'rgba(255,255,255,0.5)',
        fontSize: '0.78rem',
        color: '#9ca3af',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px',
      }}>
        <span>Перевірено: {checkedDate}</span>
        {track.isrc && <span>ISRC: {track.isrc}</span>}
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '10px 20px',
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        fontSize: '0.78rem',
        color: '#9ca3af',
        lineHeight: 1.5,
      }}>
        ⚠️ {disclaimer}
      </div>
    </div>
  )
}
