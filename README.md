<p align="center">
  <img src="frontend/public/favicon.svg" alt="YouTube Copyright Checker" width="72" />
</p>

<h1 align="center">YouTube Copyright Checker</h1>

<p align="center">
  Перевіряє трек із YouTube URL і показує ризик Content ID клейму для лайв-стрімів — окремо для трансляції та окремо для запису після неї.
</p>

---

## Навіщо це

Існуючі copyright-чекери відповідають на питання "чи заблокують це **завантажене відео**?". Для стримерів це неповна відповідь: механіка Content ID на лайв-стрімах інша — під час трансляції немає "тихої монетизації", лише попередження та пауза, а рішення про запис (VOD) правовласник приймає вже після ефіру. Цей сервіс дає окрему відповідь для обох етапів.

> [!NOTE]
> Сервіс дає **оцінку ризику**, а не офіційне підтвердження від YouTube. Публічного API "яка policy для цього треку на стрімі" не існує — рахунок ведеться на основі даних розпізнавання треку та непрямих сигналів YouTube Data API. Деталі логіки — у [`youtube_copyright_checker_spec.md`](youtube_copyright_checker_spec.md).

Результат — один із трьох статусів:

| Статус | Значення |
|---|---|
| 🟢 **GREEN** | Кліму немає — можна вмикати на стрімі |
| 🟡 **YELLOW** | Клім є (monetize/track) — стрім, ймовірно, пройде, але монетизацію заберуть, а запис можуть заблокувати |
| 🔴 **RED** | Клім блокуючий — під час стріму прийде попередження й пауза, запис заблокують |

## Архітектура

```
YouTube URL
    │
    ▼
[1] Розпізнавання треку — AudD API
    │  (назва, артист, лейбл, ISRC)
    ▼
[2] Right policy правовласника — ACRCloud (опційно)
    │  (Monetize / Allow / ReportUsage / BlockAccess)
    ▼
[3] Регіон/ліцензія — YouTube Data API v3 (опційно)
    │  (license, embeddability, regionRestriction)
    ▼
[4] Класифікація ризику → GREEN / YELLOW / RED
```

| Компонент | Стек |
|---|---|
| `backend/` | FastAPI, httpx, Redis-кеш результатів (TTL, за замовчуванням 6 год) |
| `frontend/` | React 19 + TypeScript, Vite, nginx (production) |
| `tests/` | pytest, pytest-asyncio |

## Швидкий старт

### Docker Compose (рекомендовано)

```bash
docker compose up --build
```

Фронтенд буде доступний на `http://localhost:80`, бекенд слухає всередині мережі compose на порту `8000` через Redis-кеш.

### Локально, без Docker

**Бекенд**

```bash
cd backend
cp .env.example .env   # заповніть ключі API або лишіть MOCK_MODE=true
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**Фронтенд**

```bash
cd frontend
npm install
npm run dev
```

> [!TIP]
> Без жодного API-ключа сервіс можна запустити в `MOCK_MODE=true` — ендпоінт `/api/mock-examples` завжди повертає три готові приклади (GREEN/YELLOW/RED) для розробки UI без витрат квоти.

## Змінні середовища

Повний шаблон — у [`backend/.env.example`](backend/.env.example).

| Змінна | Обов'язкова | Опис |
|---|---|---|
| `AUDD_API_TOKEN` | так (для реальних перевірок) | Розпізнавання треку. [dashboard.audd.io](https://dashboard.audd.io/) — 300 запитів безкоштовно |
| `ACRCLOUD_ACCESS_KEY` / `ACRCLOUD_ACCESS_SECRET` | ні | `right_policy` правовласника. [acrcloud.com](https://www.acrcloud.com/) — 14 днів тріалу |
| `YOUTUBE_DATA_API_KEY` | ні | Регіональні обмеження та ліцензія відео. 10 000 units/день безкоштовно |
| `MOCK_MODE` | ні | `true` — працювати без жодного зовнішнього ключа |
| `REDIS_URL` | ні | Порожньо — кеш в оперативній пам'яті процесу |
| `CACHE_TTL_SECONDS` | ні | Час життя кешованого результату (за замовчуванням `21600` = 6 год) |

## API

| Метод | Шлях | Опис |
|---|---|---|
| `GET` | `/api/health` | Стан сервісу та які API налаштовані |
| `GET` | `/api/mock-examples` | Три фіксовані приклади для розробки UI |
| `POST` | `/api/check` | Перевірка треку: `{ "url": "<youtube-url>", "region": "US", "mock": false }` |

## Тести

```bash
cd backend        # або з кореня, з PYTHONPATH=.
pytest ../tests
```

## Обмеження

- Точність висока для великих лейблів (зареєстровані в базах ACRCloud/AudD); для незалежних артистів — нижча.
- Policy правовласника може змінитись будь-коли — перевіряйте перед кожним стрімом.
- Ризик може відрізнятись за країнами (`region_restriction`).
