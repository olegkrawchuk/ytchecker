import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'ytchecker-theme'

function getInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable — theme just won't persist
    }
  }, [theme])

  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className="theme-switch"
      role="switch"
      aria-checked={isLight}
      aria-label="Перемкнути світлу/темну тему"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
    >
      <span className="theme-switch__track">
        <span className="theme-switch__knob" />
      </span>
      <span className="theme-switch__label">{isLight ? 'LIGHT' : 'DARK'}</span>
    </button>
  )
}
