import { useState, useEffect } from 'react'
import './App.css'
import { checkUrl, getMockExamples, getHealth } from './api'
import type { CheckResult, HealthResult } from './api'
import { UrlForm } from './components/UrlForm'
import { ResultCard } from './components/ResultCard'
import { StreamExplainer } from './components/StreamExplainer'
import { ThemeToggle } from './components/ThemeToggle'

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
    <div className="rack">
      <div className="panel">
        <span className="screw screw--tl" />
        <span className="screw screw--tr" />
        <span className="screw screw--bl" />
        <span className="screw screw--br" />
        <ThemeToggle />

        <div className="nameplate">
          <h1 className="nameplate__title">YouTube Copyright Checker</h1>
          <p className="nameplate__subtitle">Stream Risk Monitor — Наживо і VOD</p>
        </div>

        {health && (
          <div className="led-row">
            {Object.entries(health.apis_configured).map(([api, ok]) => (
              <span key={api} className={`led${ok ? ' led--on' : ''}`}>
                <span className="led__dot" />
                {api.toUpperCase()}
              </span>
            ))}
            {health.mock_mode && (
              <span className="led led--mock">
                <span className="led__dot" />
                MOCK MODE
              </span>
            )}
          </div>
        )}

        <div className="content">
          <div className="content__main">
            <UrlForm onSubmit={handleSubmit} loading={state === 'loading'} />

            {state === 'loading' && (
              <div className="state state--loading">
                <div className="state__lamp" />
                Розпізнаємо трек і перевіряємо policy…
              </div>
            )}

            {state === 'error' && error && (
              <div className="state state--error">
                <strong>Помилка:</strong> {error}
              </div>
            )}

            {state === 'result' && result && <ResultCard result={result} />}

            <StreamExplainer />
          </div>

          {examples.length > 0 && (
            <div className="content__aside">
              <h3 className="presets__title">Приклади результатів</h3>
              <div className="presets__grid">
                {examples.map((ex, i) => (
                  <ResultCard key={i} result={ex} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="serial-plate">
          {import.meta.env.VITE_APP_VERSION ?? 'dev'}
        </div>
      </div>
    </div>
  )
}
