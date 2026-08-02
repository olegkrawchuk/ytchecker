import { useState, useEffect } from 'react'
import { checkUrl, getMockExamples, getHealth } from './api'
import type { CheckResult, HealthResult } from './api'
import { UrlForm } from './components/UrlForm'
import { ResultCard } from './components/ResultCard'
import { StreamExplainer } from './components/StreamExplainer'

type AppState = 'idle' | 'loading' | 'result' | 'error'

export default function App() {
  const [state, setState] = useState<AppState>('idle')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthResult | null>(null)
  const [examples, setExamples] = useState<CheckResult[]>([])

  useEffect(() => {
    getHealth().then(setHealth).catch(() => null)
    getMockExamples().then(setExamples).catch(() => null)
  }, [])

  const handleSubmit = async (url: string, region: string) => {
    setState('loading')
    setError(null)
    try {
      const res = await checkUrl(url, region)
      setResult(res)
      setState('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
      setState('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: '#1f2937',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(24px, 8vw, 40px) clamp(12px, 4vw, 20px) 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>
            🎵 YouTube Copyright Checker
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
            Дізнайся що буде з треком на <strong>стрімі</strong> — не тільки на завантаженому відео
          </p>
        </div>

        {/* API status chips */}
        {health && (
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '24px',
          }}>
            {Object.entries(health.apis_configured).map(([api, ok]) => (
              <span key={api} style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: ok ? '#dcfce7' : '#f3f4f6',
                color: ok ? '#15803d' : '#9ca3af',
                border: `1px solid ${ok ? '#86efac' : '#e5e7eb'}`,
              }}>
                {ok ? '✓' : '✗'} {api.toUpperCase()}
              </span>
            ))}
            {health.mock_mode && (
              <span style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
              }}>
                MOCK MODE
              </span>
            )}
          </div>
        )}

        {/* Form */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          marginBottom: '20px',
        }}>
          <UrlForm onSubmit={handleSubmit} loading={state === 'loading'} />
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
            <div>Розпізнаємо трек і перевіряємо policy...</div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && error && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            marginBottom: '20px',
          }}>
            <strong>❌ Помилка:</strong> {error}
          </div>
        )}

        {/* Result */}
        {state === 'result' && result && (
          <div style={{ marginBottom: '20px' }}>
            <ResultCard result={result} />
          </div>
        )}

        {/* Explainer */}
        <div style={{ marginBottom: '32px' }}>
          <StreamExplainer />
        </div>

        {/* Example results (only shown on idle) */}
        {examples.length > 0 && state === 'idle' && (
          <div>
            <h3 style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 14px',
            }}>
              Приклади результатів
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {examples.map((ex, i) => (
                <ResultCard key={i} result={ex} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#d1d5db',
        }}>
          v{import.meta.env.VITE_APP_VERSION ?? 'dev'}
        </div>

      </div>
    </div>
  )
}
