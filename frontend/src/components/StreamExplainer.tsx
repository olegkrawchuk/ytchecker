export function StreamExplainer() {
  return (
    <details className="explainer">
      <summary className="explainer__summary">
        ℹ Як YouTube поводиться зі стрімами? (чому це важливо)
      </summary>

      <div className="explainer__body">
        <div>
          <strong>Звичайний чекер каже тобі про відео — а не про стрім</strong>
          <p>
            Коли ти завантажуєш відео з захищеною музикою, YouTube ставить Content ID claim і забирає
            монетизацію або блокує відео. Але зі стрімами — інша механіка.
          </p>
        </div>

        <div>
          <strong>Стадія 1 — під час стріму (live)</strong>
          <p>
            YouTube виявляє захищений трек і надсилає тобі <strong>попередження в OBS/Studio</strong> зупинити музику.
            Якщо ти реагуєш — стрім продовжується без наслідків.
            Якщо ігноруєш — стрім <strong>тимчасово переривається</strong> (тиша + placeholder image).
            Якщо продовжуєш — стрім <strong>завершується примусово</strong>.
          </p>
          <p style={{ color: 'var(--steel-600)' }}>
            Тихої монетизації на лайві немає: або попередження+пауза, або нічого (якщо трек не в базі).
          </p>
        </div>

        <div>
          <strong>Стадія 2 — запис після стріму (VOD)</strong>
          <p>
            Content ID claims виставляються на VOD <strong>після завершення стріму</strong>.
            На відміну від звичайних відео, для VOD немає варіанту "monetize" —
            правовласник може або <strong>заблокувати запис повністю</strong>, або не робити нічого.
            Тобто навіть якщо стрім пройшов без проблем — запис потім можуть видалити.
          </p>
        </div>

        <div>
          <strong>Наслідки порушень</strong>
          <ul>
            <li>Content ID claim (не страйк) → не впливає на канал, але може заблокувати VOD</li>
            <li>Перше порушення Community Guidelines → втрата права стрімити на 14 днів</li>
            <li>Три copyright strikes за 90 днів → канал видаляється</li>
          </ul>
        </div>

        <div className="explainer__note">
          <strong>Про цей сервіс:</strong> ми перевіряємо треки через AudD і YouTube Data API.
          Результат — оцінка ризику, а не офіційне підтвердження YouTube.
          Точність висока для великих лейблів (Universal, Sony, Warner), нижча для незалежних артистів.
          Перевіряй перед кожним стрімом — policy правовласника може змінитись будь-коли.
        </div>
      </div>
    </details>
  )
}
