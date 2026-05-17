# LMS Backend

## Setup

### 1. Create virtualenv

```bash
python -m venv .venv
```

### 2. Activate

Windows:
```bash
.venv\Scripts\activate
```

Mac/Linux:
```bash
source .venv/bin/activate
```

### 3. Install deps

```bash
pip install -r requirements.txt
```

### 4. Create PostgreSQL databases

```sql
CREATE DATABASE lms_db;
CREATE DATABASE lms_messages_db;
```

### 5. Create .env

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/lms_db
MESSAGES_DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/lms_messages_db
SECRET_KEY=super_secret_key
```

`MESSAGES_DATABASE_URL` — отдельная БД для личных сообщений. Пользователи связываются по `User.id` из основной БД (`DATABASE_URL`). Если `MESSAGES_DATABASE_URL` не задан, используется `DATABASE_URL`.

### 6. Run DB init

```bash
python -m app.db.base
python -m app.db.chat_base
```

### 7. Собрать фронтенд (один раз или после изменений UI)

```bash
cd frontend/my-dashboard
npm install
npm run build
```

### 8. Запуск (фронт + API на одном порту)

Из каталога `Backend`:

```bash
uvicorn app.main:app --reload
```

Откройте в браузере: **http://localhost:8000/login** — интерфейс и авторизация (`POST /auth/login`).

Проверка API без UI: http://localhost:8000/docs

### Разработка UI с hot-reload (опционально)

В двух терминалах:

```bash
# 1 — бэкенд
cd Backend && uvicorn app.main:app --reload

# 2 — Vite
cd frontend/my-dashboard && npm run dev
```

Фронт: http://localhost:5173/login (запросы к API проксируются на :8000).