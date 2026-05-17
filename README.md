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

### 7. Run API

```bash
uvicorn app.main:app --reload
```