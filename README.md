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

### 4. Create PostgreSQL database

Create DB:
```sql
CREATE DATABASE lms_db;
```

### 5. Create .env

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/lms_db
SECRET_KEY=super_secret_key
```

### 6. Run DB init

```bash
python -m app.db.base
```

### 7. Run API

```bash
uvicorn app.main:app --reload
```