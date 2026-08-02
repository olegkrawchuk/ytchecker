import type { CheckResult, Status } from '../api'
import { StatusBadge } from './StatusBadge'

interface Props {
  result: CheckResult
}

const RESULT_COLOR: Record<Status, string> = {
  GREEN:  'var(--tally-green)',
  YELLOW: 'var(--tally-amber)',
  RED:    'var(--tally-red)',
}

function Channel({ lampColor, label, text }: { lampColor: string; label: string; text: string }) {
  return (
    <div className="channel">
      <span className="channel__lamp" style={{ '--lamp-color': lampColor } as React.CSSProperties} aria-hidden="true" />
      <div>
        <div className="channel__label">{label}</div>
        <div className="channel__text">{text}</div>
      </div>
    </div>
  )
}

export function ResultCard({ result }: Props) {
  const { status, confidence, track, live_verdict, vod_verdict, checked_at, disclaimer } = result
  const checkedDate = new Date(checked_at).toLocaleString('uk-UA')
  const color = RESULT_COLOR[status]

  return (
    <div className="result" style={{ '--result-color': color } as React.CSSProperties}>
      <StatusBadge key={checked_at} status={status} confidence={confidence} />

      {track.recognized ? (
        <div className="result__track-block">
          <div className="result__track">
            {track.title ?? '—'}
            {track.artist && <span className="result__artist"> — {track.artist}</span>}
          </div>
          {track.label && (
            <div className="result__meta">
              {track.label}
              {track.release_date && ` · ${track.release_date}`}
            </div>
          )}
        </div>
      ) : (
        <div className="result__unrecognized">Трек не розпізнано в базах</div>
      )}

      <div className="channels">
        <Channel lampColor={color} label="Наживо" text={live_verdict} />
        <Channel lampColor={color} label="Запис (VOD)" text={vod_verdict} />
      </div>

      <div className="result__footer">
        <span>Перевірено: {checkedDate}</span>
        {track.isrc && <span>ISRC: {track.isrc}</span>}
      </div>

      <div className="result__disclaimer">⚠ {disclaimer}</div>
    </div>
  )
}
