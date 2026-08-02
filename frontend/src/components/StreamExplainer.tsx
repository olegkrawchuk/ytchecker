export function StreamExplainer() {
  return (
    <details style={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <summary style={{
        padding: '14px 18px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#374151',
        background: '#f9fafb',
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none',
      }}>
        <span>ℹ️</span> Як YouTube поводиться зі стрімами? (чому це важливо)
      </summary>

      <div style={{ padding: '18px', fontSize: '0.88rem', color: '#374151', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <div>
          <strong>🔴 Звичайний чекер кажуть тобі про відео — а не про стрім</strong>
          <p style={{ margin: '6px 0 0' }}>
            Коли ти завантажуєш відео з захищеною музикою, YouTube ставить Content ID claim і забирає
            монетизацію або блокує відео. Але зі стрімами — інша механіка.
          </p>
        </div>

        <div>
          <strong>📡 Стадія 1 — під час стріму (live)</strong>
          <p style={{ margin: '6px 0 0' }}>
            YouTube виявляє захищений трек і надсилає тобі <strong>попередження в OBS/Studio</strong> зупинити музику.
            Якщо ти реагуєш — стрім продовжується без наслідків.
            Якщо ігноруєш — стрім <strong>тимчасово переривається</strong> (тиша + placeholder image).
            Якщо продовжуєш — стрім <strong>завершується примусово</strong>.
          </p>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
            ⚠️ Тихої монетизації на лайві немає: або попередження+пауза, або нічого (якщо трек не в базі).
          </p>
        </div>

        <div>
          <strong>🗂️ Стадія 2 — запис після стріму (VOD)</strong>
          <p style={{ margin: '6px 0 0' }}>
            Content ID claims виставляються на VOD <strong>після завершення стріму</strong>.
            На відміну від звичайних відео, для VOD немає варіанту "monetize" —
            правовласник може або <strong>заблокувати запис повністю</strong>, або не робити нічого.
            Тобто навіть якщо стрім пройшов без проблем — запис потім можуть видалити.
          </p>
        </div>

        <div>
          <strong>📋 Наслідки порушень</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Content ID claim (не страйк) → не впливає на канал, але може заблокувати VOD</li>
            <li>Перше порушення Community Guidelines → втрата права стрімити на 14 днів</li>
            <li>Три copyright strikes за 90 днів → канал видаляється</li>
          </ul>
        </div>

        <div style={{ padding: '10px 14px', background: '#f0f9ff', borderRadius: '8px', borderLeft: '3px solid #38bdf8', fontSize: '0.82rem', color: '#0369a1' }}>
          <strong>Про цей сервіс:</strong> ми перевіряємо треки через AudD і YouTube Data API.
          Результат — оцінка ризику, а не офіційне підтвердження YouTube.
          Точність висока для великих лейблів (Universal, Sony, Warner), нижча для незалежних артистів.
          Перевіряй перед кожним стрімом — policy правовласника може змінитись будь-коли.
        </div>

      </div>
    </details>
  )
}
