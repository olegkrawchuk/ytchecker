# YouTube Copyright Checker для стрімів — Технічна специфікація

## Мета проекту

Сервіс приймає YouTube URL (пісні або відео), визначає чи є на трек Content ID клім, яка policy правовласника, і видає стримеру:
- 🟢 **Зелений** — немає кліму, можна вмикати на стрімі
- 🟡 **Жовтий** — є клім, policy = monetize/track → на стрімі може пройти без переривання, але запис після стріму можуть заблокувати; монетизацію заберуть
- 🔴 **Червоний** — є клім, policy = block → стрім заглушать або зупинять

---

## Контекст: як YouTube поводиться зі стрімами

### Три типи policy в Content ID
- **Monetize** — реклама йде правовласнику, стрім продовжується
- **Track** — стрім продовжується, аналітика іде правовласнику, без реклами
- **Block** — аудіо заглушується або стрім зупиняється повністю

### Важливо: лайв-стріми працюють у два етапи

**Етап 1 — під час стріму (live):**
- YouTube виявляє захищений контент і надсилає стримеру **попередження** зупинити трек
- Якщо стример реагує і прибирає музику — стрім продовжується без наслідків
- Якщо ігнорує — стрім тимчасово переривається (placeholder image + тиша), потім може відновитись
- Якщо порушення продовжується — стрім завершується примусово
- На цьому етапі немає "тихої монетизації": або попередження+пауза, або нічого (якщо трек не в базі)

**Етап 2 — збережений запис (VOD) після стріму:**
- Content ID claims виставляються на запис **тільки після завершення стріму**, якщо стример зберіг його як відео
- На записі стріму правовласник може або **заблокувати запис**, або **не робити нічого**
- Варіантів "monetize" або "track" для запису стріму немає — на відміну від звичайних завантажених відео
- Тобто навіть якщо стрім пройшов нормально — запис потім можуть видалити

**Звідси практичний висновок для стримера:**
- Трек з policy "monetize" для звичайних відео → на стрімі може пройти тихо, але запис можуть заблокувати
- Трек з policy "block" → під час стріму прийде попередження і пауза
- Трек не в базі Content ID → скоріш за все пройде без проблем і на стрімі і в записі

**Чому трек іноді проходить без проблем:**
- Пісня не зареєстрована в Content ID (незалежні артисти, старий контент)
- Детекція спрацювала із затримкою, а пісня вже закінчилась
- Policy правовласника = monetize, він просто забрав монетизацію запису без переривання стріму

**Інші обмеження:**
- Creator Music (куплені ліцензії для відео) **не покриває лайв-стріми** — це окрема ліцензія
- З 2025 року YouTube запустив AI-детекцію, яка розпізнає pitch-down, spedup, filter-distorted версії
- Trending sounds зі Shorts/Reels/TikTok не можна використовувати на стрімах — ліцензія покриває тільки short-form екосистему

### Наслідки порушень на стрімі
- Перше порушення community guidelines: втрата права стрімити на **14 днів**
- Три copyright strikes за 90 днів → канал видаляється
- Один strike → live streaming access suspended
- Content ID claim (не strike) → не впливає на канал, але може заблокувати запис

---

## Технічна архітектура

### Загальний флоу
```
YouTube URL
    ↓
[Крок 1] Розпізнавання треку (AudD API або ACRCloud)
    → повертає: назва, артист, лейбл, ISRC, UPC
    ↓
[Крок 2] Визначення policy правовласника (ACRCloud metadata або непрямий сигнал)
    → right_policy: Monetize / Allow / ReportUsage / BlockAccess
    ↓
[Крок 3] Перевірка через YouTube Data API v3 (непрямий сигнал)
    → license, embeddability, regionRestriction
    ↓
[Крок 4] Логіка: вивести зелений/жовтий/червоний статус
```

---

## API та інструменти

### 1. AudD API — розпізнавання треку

**Документація:** https://docs.audd.io/

**Головний ендпоінт:**
```
POST https://api.audd.io/
```

**Параметри:**
- `api_token` — токен з dashboard.audd.io (300 безкоштовних запитів)
- `url` — YouTube URL напряму (не потрібно завантажувати аудіо!)
- `return` — додаткові метадані: `apple_music,spotify`

**Приклад запиту:**
```bash
curl https://api.audd.io/ \
  -F url='https://www.youtube.com/watch?v=VIDEO_ID' \
  -F return='apple_music,spotify' \
  -F api_token='YOUR_TOKEN'
```

**Приклад відповіді:**
```json
{
  "status": "success",
  "result": {
    "artist": "Imagine Dragons",
    "title": "Warriors",
    "album": "Warriors",
    "release_date": "2014-09-18",
    "label": "Universal Music",
    "timecode": "02:32",
    "song_link": "https://lis.tn/Warriors",
    "apple_music": { ... },
    "spotify": { ... }
  }
}
```

**Ціна:** $2–5 за 1000 запитів. Перші 300 — безкоштовно.

**Важливо:** AudD приймає YouTube URL напряму — не потрібен yt-dlp для базового розпізнавання.

**Enterprise endpoint** (для довгих файлів):
```
POST https://enterprise.audd.io/
```
Рахується як 1 запит за кожні 12 секунд аудіо.

---

### 2. ACRCloud — розпізнавання + policy правовласника

**Сайт:** https://www.acrcloud.com/
**Документація:** https://docs.acrcloud.com/

**Можливості:**
- База 150+ мільйонів треків
- Приймає YouTube URL напряму
- **Повертає `right_policy`** — це ключова відмінність від AudD

**Поле `right_policy` у відповіді:**
```
"Monetize"    → стрім продовжиться, монетизацію заберуть
"Allow"       → дозволено, зелений статус
"ReportUsage" → тільки аналітика, без блокування
"BlockAccess" → стрім заглушать/зупинять
```

**Плюс:** підтримка territory codes (ISO country codes) — policy може відрізнятись по країнах.

**Пробний період:** 14 днів безкоштовно, повний доступ до API.

**File Scan через UI (для тестування):**
- Інтерфейс: https://docs.acrcloud.com/tutorials/recognize-music
- Підтримує: аудіофайли, fingerprint, YouTube URL, TikTok/Facebook/Instagram

---

### 3. YouTube Data API v3 — непрямий сигнал

**Документація:** https://developers.google.com/youtube/v3/docs/videos

**Мета:** перевірити офіційне відео треку і вивести сигнали про policy.

**Ендпоінт:**
```
GET https://www.googleapis.com/youtube/v3/videos
  ?part=status,contentDetails,snippet
  &id=VIDEO_ID
  &key=YOUR_API_KEY
```

**Корисні поля у відповіді:**
- `status.license` — `youtube` або `creativeCommon`
- `status.embeddable` — чи можна вбудувати (сигнал обмежень)
- `contentDetails.regionRestriction.blocked` — список заблокованих країн
- `contentDetails.regionRestriction.allowed` — список дозволених країн

**Логіка використання:**
1. Отримали ISRC з AudD → знайти офіційне відео цього треку на YouTube
2. Перевірити його metadata через Data API
3. Наявність `regionRestriction` або `license != creativeCommon` → сигнал про обмеження

**Квота:** безкоштовно, 10,000 units/день за замовчуванням.

---

### 4. yt-dlp — витяг аудіо (якщо потрібно)

**GitHub:** https://github.com/yt-dlp/yt-dlp

Використовується якщо потрібно витягти аудіо для власної обробки (наприклад, для ACRCloud file upload замість URL).

**Витяг 30-секундного сегменту:**
```bash
yt-dlp -x --audio-format mp3 \
  --download-sections "*00:00:30-00:01:00" \
  -o "sample.mp3" \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

**Тільки метадані (без завантаження):**
```bash
yt-dlp --dump-json "https://www.youtube.com/watch?v=VIDEO_ID"
```

**Правовий статус:** сам інструмент легальний (функціонально схожий на браузер з парсером). Для перевірки (не збереження) — прийнятний підхід. YouTube ToS формально забороняє, але для некомерційної перевірки enforcement мінімальний.

---

## Обмеження, які треба знати

### Чого немає публічно
**YouTube Content ID API** — закритий, тільки для верифікованих правовласників (Sony, Warner, Universal і т.д.). Публічного ендпоінту "яка policy для цього треку на стрімі" — не існує.

### Що це означає на практиці
Сервіс дає **оцінку ризику**, а не офіційне підтвердження від YouTube. Для 95% треків великих лейблів — точність висока (бо вони всі зареєстровані в ACRCloud/AudD базах). Для незалежних андеграундних артистів — менша.

### Policy може змінитись
Правовласники змінюють policy будь-коли. Те, що трек сьогодні дозволений — завтра може бути заблокований. Варто показувати дату перевірки і рекомендувати перевіряти перед кожним стрімом.

### Територіальні відмінності
Policy може бути різною для різних країн. Трек може бути дозволений в США, але заблокований у Німеччині. ACRCloud повертає territory codes — варто враховувати локацію стримера.

### Специфіка лайв-стрімів
Жоден публічний сервіс не дає точної відповіді "що станеться саме на стрімі" — всі вони перевіряють policy для завантажених відео. Для стрімів завжди жорсткіше. Це і є ключова ніша цього сервісу.

---

## Рекомендована логіка класифікації

Відповідь має бути у двох вимірах: що буде **під час стріму** і що буде з **записом після**.

```python
def classify_risk(right_policy, label, region_restricted):
    # Якщо ACRCloud повернув явну policy
    if right_policy == "Allow":
        return {
            "status": "GREEN",
            "live": "Можна вмикати — трек дозволений",
            "vod": "Запис збережеться без обмежень"
        }

    if right_policy == "BlockAccess":
        return {
            "status": "RED",
            "live": "Прийде попередження, стрім може перерватись якщо не прибереш",
            "vod": "Запис буде заблоковано після стріму"
        }

    if right_policy in ("Monetize", "ReportUsage"):
        return {
            "status": "YELLOW",
            "live": "Стрім скоріш за все не перервуть, але є ризик попередження",
            "vod": "Запис можуть заблокувати або забрати монетизацію на користь правовласника"
        }

    # Якщо policy невідома, але трек з великого лейблу
    BIG_LABELS = ["Universal Music", "Sony Music", "Warner Music", "Republic Records",
                  "Atlantic Records", "Island Records", "Interscope", "Columbia Records"]
    if any(lbl in label for lbl in BIG_LABELS):
        return {
            "status": "RED",
            "live": "Великий лейбл — високий ризик попередження під час стріму",
            "vod": "Запис скоріш за все заблокують після стріму"
        }

    # Регіональні блокування через YouTube API
    if region_restricted:
        return {
            "status": "YELLOW",
            "live": "Є регіональні обмеження — залежить від локації глядачів",
            "vod": "Запис може бути недоступний в окремих країнах"
        }

    # Трек розпізнано, але policy невідома
    if label:
        return {
            "status": "YELLOW",
            "live": "Точна policy невідома — рекомендуємо не вмикати на монетизованому стрімі",
            "vod": "Невідомо що буде із записом"
        }

    # Трек не розпізнано
    return {
        "status": "GREEN",
        "live": "Трек не знайдено в базах — ймовірно пройде без проблем",
        "vod": "Запис скоріш за все збережеться без обмежень"
    }
```

---

## Приклад повного флоу (Python)

```python
import requests

AUDD_TOKEN = "your_audd_token"
YT_API_KEY = "your_youtube_api_key"

def check_youtube_url(youtube_url: str) -> dict:
    # Крок 1: розпізнати трек через AudD
    audd_resp = requests.post("https://api.audd.io/", data={
        "url": youtube_url,
        "return": "apple_music,spotify",
        "api_token": AUDD_TOKEN
    })
    audd_data = audd_resp.json()
    
    if audd_data["status"] != "success" or not audd_data["result"]:
        return {"status": "GREEN", "message": "Трек не розпізнано — ймовірно немає кліму"}
    
    result = audd_data["result"]
    track_info = {
        "title": result.get("title"),
        "artist": result.get("artist"),
        "label": result.get("label"),
        "isrc": result.get("song_link"),  # або з apple_music/spotify метаданих
    }
    
    # Крок 2: перевірити через YouTube Data API (непрямий сигнал)
    video_id = extract_video_id(youtube_url)
    yt_resp = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "status,contentDetails",
            "id": video_id,
            "key": YT_API_KEY
        }
    )
    yt_data = yt_resp.json()
    
    region_restricted = False
    if yt_data.get("items"):
        item = yt_data["items"][0]
        content_details = item.get("contentDetails", {})
        if content_details.get("regionRestriction"):
            region_restricted = True
    
    # Крок 3: класифікація
    label = track_info.get("label", "")
    status, message = classify_risk(
        right_policy=None,  # якщо використовуємо тільки AudD
        label=label,
        region_restricted=region_restricted
    )
    
    return {
        "status": status,
        "message": message,
        "track": track_info
    }
```

---

## Унікальність сервісу vs існуючі аналоги

### Що вміють існуючі сервіси
- Розпізнати трек по URL
- Сказати чи є Content ID клім
- Показати загальну policy (monetize/block/track)

Це покриває основний сценарій для **завантажених відео**.

### Чого не роблять існуючі сервіси

**1. Ніхто не пояснює різницю "відео vs стрім"**
Всі існуючі сервіси дають відповідь в контексті завантаженого відео. Ця відповідь неповна для стримера — механіка інша. Сервіс має явно пояснювати:
> "На завантаженому відео — заберуть монетизацію. На стрімі — прийде попередження і можлива пауза. Запис після стріму можуть заблокувати."

**2. Ніхто не попереджає про долю VOD (запису)**
Стримери зазвичай зберігають записи. Знати що станеться з VOD після стріму — окрема цінна відповідь якої немає ніде в одному місці.

**3. UX заточений під відео-едитора, а не під стримера**
Існуючі сервіси думають про людину яка монтує відео. Стример має інші питання: чи перервуть стрім прямо зараз, чи збережеться запис, чи прийде попередження чи одразу блок.

### Чесне обмеження цього сервісу
Технічна база — та сама (AudD або ACRCloud). Унікальність в **інтерпретації результату і UX**, а не в унікальних даних. Якщо великий гравець (Streamlabs, OBS) захоче зробити те саме — зробить швидко.

**Практичний висновок:** це корисний особистий інструмент і потенційно корисний для спільноти стримерів, але не продукт з великим захисним ровом. Оптимальний шлях: зробити для себе як скрипт або простий веб-інструмент, перевірити чи є попит, і тоді вирішувати чи розвивати далі.

---



| Сервіс | URL | Що робить | Обмеження |
|--------|-----|-----------|-----------|
| ToolXP | toolxp.org/tools/youtube-music-copyright-checker | Перевіряє URL, показує тип кліму | Тільки для завантажених відео |
| Mubert checker | mubert.com/tools/copyright-checker | Завантаження файлу, перевірка по базах | Потребує файл, не URL |
| ACRCloud UI | docs.acrcloud.com/tutorials/recognize-music | Повна перевірка з policy | B2B, не для стримерів |
| videodubber.ai | videodubber.ai/tools/youtube/copyright-checker | Сканує відео | Загальна перевірка |
| YTMonetizer | ytmonetizer.com/tools/youtube/copyright-checker | YouTube Data API v3 | Тільки license/region, без музичного аудіо-аналізу |

**Нікуди не підходить:** жоден не дає відповідь специфічно для лайв-стрімів.

---

## Стек для реалізації (рекомендація)

### Backend
- **Python** (FastAPI або Flask)
- `requests` для API викликів
- `yt-dlp` як опція для витягу аудіо
- Redis для кешування результатів (policy рідко змінюється)

### Frontend
- Простий React або навіть чистий HTML
- Поле вводу URL → кнопка перевірки → результат зелений/жовтий/червоний

### Ключові ENV змінні
```
AUDD_API_TOKEN=...
ACRCLOUD_ACCESS_KEY=...
ACRCLOUD_ACCESS_SECRET=...
YOUTUBE_DATA_API_KEY=...
```

### Послідовність реєстрацій
1. **AudD** — dashboard.audd.io → 300 безкоштовних запитів одразу
2. **ACRCloud** — acrcloud.com → 14 днів повного тріалу
3. **YouTube Data API** — console.cloud.google.com → увімкнути YouTube Data API v3 → безкоштовно 10k req/день

---

## Важливі джерела

- YouTube Content ID policy офіційно: https://developers.google.com/youtube/partner/rights_management
- Як Content ID працює для стрімів: https://support.google.com/youtube/answer/6013276
- AudD документація: https://docs.audd.io/
- ACRCloud документація: https://docs.acrcloud.com/
- YouTube Data API v3 videos endpoint: https://developers.google.com/youtube/v3/docs/videos
- YouTube правила для лайв-стрімів 2026: https://blog.veefly.com/youtube/streaming-rules/
