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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          disabled={loading}
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1.5px solid #d1d5db',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = '#3b82f6')}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            flexShrink: 0,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#9ca3af' : '#3b82f6',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳ Перевірка...' : '🔍 Перевірити'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
          Регіон стріму:
        </label>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          disabled={loading}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1.5px solid #d1d5db',
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: '#fff',
          }}
        >
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Policy може відрізнятись по країнах
        </span>
      </div>
    </form>
  )
}
