import { useState } from 'react'

const REGIONS = [
  { code: 'UA', name: '🇺🇦 Україна' },
  { code: 'US', name: '🇺🇸 США' },
  { code: 'GB', name: '🇬🇧 Велика Британія' },
  { code: 'DE', name: '🇩🇪 Німеччина' },
  { code: 'FR', name: '🇫🇷 Франція' },
  { code: 'CA', name: '🇨🇦 Канада' },
  { code: 'AU', name: '🇦🇺 Австралія' },
  { code: 'JP', name: '🇯🇵 Японія' },
  { code: 'KR', name: '🇰🇷 Корея' },
  { code: 'BR', name: '🇧🇷 Бразилія' },
  { code: 'PL', name: '🇵🇱 Польща' },
]

interface Props {
  onSubmit: (url: string, region: string) => void
  loading: boolean
}

export function UrlForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState('')
  const [region, setRegion] = useState('UA')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (trimmed) onSubmit(trimmed, region)
  }

  return (
    <form onSubmit={handleSubmit} className="input-strip">
      <div className="input-strip__row">
        <input
          type="url"
          className="input-strip__field"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          disabled={loading}
        />
        <button type="submit" className="input-strip__button" disabled={loading || !url.trim()}>
          {loading ? 'ПЕРЕВІРКА…' : 'ПЕРЕВІРИТИ'}
        </button>
      </div>

      <div className="input-strip__row">
        <label className="input-strip__label" htmlFor="region">Регіон стріму</label>
        <select
          id="region"
          className="input-strip__select"
          value={region}
          onChange={e => setRegion(e.target.value)}
          disabled={loading}
        >
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
        <span className="input-strip__hint">Policy може відрізнятись по країнах</span>
      </div>
    </form>
  )
}
