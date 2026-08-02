export type Status = 'GREEN' | 'YELLOW' | 'RED'
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'

export interface TrackInfo {
  title: string | null
  artist: string | null
  label: string | null
  release_date: string | null
  isrc: string | null
  recognized: boolean
}

export interface CheckResult {
  status: Status
  live_verdict: string
  vod_verdict: string
  confidence: Confidence
  track: TrackInfo
  signals: Record<string, unknown>
  checked_at: string
  disclaimer: string
}

export interface HealthResult {
  status: string
  apis_configured: {
    audd: boolean
    acrcloud: boolean
    youtube: boolean
  }
  mock_mode: boolean
}

export async function checkUrl(url: string, region = 'US', mock = false): Promise<CheckResult> {
  const resp = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, region, mock }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Невідома помилка' }))
    throw new Error(err.detail ?? `HTTP ${resp.status}`)
  }

  return resp.json()
}

export async function getMockExamples(): Promise<CheckResult[]> {
  const resp = await fetch('/api/mock-examples')
  if (!resp.ok) throw new Error('Не вдалось отримати приклади')
  return resp.json()
}

export async function getHealth(): Promise<HealthResult> {
  const resp = await fetch('/api/health')
  if (!resp.ok) throw new Error('Сервер недоступний')
  return resp.json()
}
