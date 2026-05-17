# Адаптатор (LMS MVP)

Система адаптации сотрудников: FastAPI-бэкенд, React-дашборд, PostgreSQL.  
Фронт: `frontend/my-dashboard` · API: `Backend/` · демо-данные: `demo/`.

## Стек

| Часть | Технологии |
|--------|------------|
| Backend | Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL, JWT |
| Frontend | React 19, Vite, React Router |
| БД | `lms_db` (основная), `lms_messages_db` (чат, опционально) |

## Структура репозитория

```
ilita/
├── Backend/              # API (uvicorn)
├── frontend/my-dashboard # SPA (Vite)
├── demo/                 # дампы БД и скрипты restore/dump
└── README.md
```

## Требования

- **Python** 3.12+
- **Node.js** 18+ и npm
- **PostgreSQL** 16+ (установлен сервер; на Windows утилиты в `C:\Program Files\PostgreSQL\<версия>\bin`)
- Git

---

## Быстрый старт (с демо-данными)

Подходит для показа решения: в репозитории лежит дамп с тестовыми пользователями и курсами.

### 1. PostgreSQL

Убедитесь, что сервер PostgreSQL запущен (порт `5432`).

### 2. Восстановить БД из `demo/`

**Windows (PowerShell), из корня репозитория:**

```powershell
.\demo\restore.ps1
```

Скрипт пересоздаёт `lms_db` и при наличии файла — `lms_messages_db` из `demo/*.dump`.  
По умолчанию пользователь БД: `postgres`, пароль: `postgres` (переменная `PGPASSWORD`).

**Linux / macOS** (если `pg_restore` в PATH):

```bash
export PGPASSWORD=postgres
dropdb -U postgres --if-exists lms_db && createdb -U postgres lms_db
pg_restore -U postgres -d lms_db --no-owner demo/lms_db.dump
```

Если файла `demo/lms_messages_db.dump` нет — чат можно не поднимать; для основного UI достаточно `lms_db`.

### 3. Backend

```bash
cd Backend
python -m venv .venv
```

Активация venv:

- Windows: `.venv\Scripts\activate`
- Linux/macOS: `source .venv/bin/activate`

```bash
pip install -r requirements.txt
```

Создайте `Backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/lms_db
MESSAGES_DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/lms_messages_db
SECRET_KEY=super_secret_key
```

`MESSAGES_DATABASE_URL` нужен только для чата. Если отдельная БД для сообщений не создана, можно временно указать тот же URL, что и `DATABASE_URL`, или создать пустую `lms_messages_db` и выполнить `python -m app.db.chat_base`.

Запуск API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Frontend

В **новом** терминале:

```bash
cd frontend/my-dashboard
npm install
npm run dev
```

Файл `frontend/my-dashboard/.env.development` уже настроен: запросы идут на `/api`, Vite проксирует их на `http://127.0.0.1:8000`.

### 5. Открыть приложение

| Сервис | URL |
|--------|-----|
| UI | http://localhost:5173 |
| API | http://127.0.0.1:8000 |
| Swagger | http://127.0.0.1:8000/docs |

Вход: учётные записи из восстановленного дампа (email + пароль, которые были при снятии `demo/lms_db.dump`).  
пароли и почты разных ролей:
роль: почта, пароль
HR: HR@mail, HR
стажер: str@mail, 1234
ментор: string2@mail, 1234
Список пользователей в БД:

```sql
SELECT id, email, first_name, last_name FROM users;
```

---

## Полный запуск с нуля (без дампа)

Если папки `demo/*.dump` нет или нужна пустая схема.

### 1. Создать базы

```sql
CREATE DATABASE lms_db;
CREATE DATABASE lms_messages_db;
```

### 2. Применить схему

```bash
cd Backend
# venv и pip install — как выше
python -m app.db.base
python -m app.db.chat_base
```

### 3. Создать пользователей и контент

Через Swagger (`/docs`): `POST /auth/login` не сработает, пока нет пользователей.  
Создайте первого пользователя напрямую в БД или временно добавьте seed/запросы.

После появления пользователя с ролью `admin` или `hr`:

- `POST /users/` — сотрудники
- `POST /courses/` — курсы
- `POST /courses/{id}/assign` — назначение курса
- `POST /courses/{id}/start` — старт прохождения (для `GET /me/courses`)

### 4. Backend и frontend

Как в разделе «Быстрый старт», шаги 3–5.

---

## Демо-данные: обновить и передать

**Снять дамп (Windows):**

```powershell
$env:PGPASSWORD = "postgres"
.\demo\dump.ps1
```

Или вручную:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -h 127.0.0.1 -Fc -f demo\lms_db.dump lms_db
```

Папку `demo/` (дампы + `dump.ps1` + `restore.ps1`) можно коммитить в репозиторий, если размер дампов небольшой.  
Файл `.env` в git не кладите.

---

## Переменные окружения

### Backend (`Backend/.env`)

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Основная БД (`lms_db`) |
| `MESSAGES_DATABASE_URL` | БД чата; если не задана — используется `DATABASE_URL` |
| `SECRET_KEY` | Ключ для JWT |
| `CORS_ORIGINS` | Опционально, через запятую (по умолчанию localhost:5173) |

### Frontend (`frontend/my-dashboard/.env.development`)

| Переменная | Описание |
|------------|----------|
| `VITE_API_URL` | `/api` в dev (прокси Vite) |

Для production-сборки задайте полный URL API, например `VITE_API_URL=https://api.example.com`.

---

## Основные API (для отладки)

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/auth/login` | Вход |
| GET | `/auth/me` | Текущий пользователь |
| GET | `/me/dashboard` | Профиль, опросы, события |
| GET | `/me/courses` | Курсы с прогрессом |
| GET | `/courses/` | Каталог курсов |
| GET | `/courses/{id}` | Детали курса |
| GET | `/courses/{id}/progress` | Прогресс по страницам |
| POST | `/courses/{id}/start` | Начать курс |

---

## Частые проблемы

### `pg_dump` не найден (Windows)

Утилиты не в PATH. Используйте полный путь или скрипты из `demo/`:

`C:\Program Files\PostgreSQL\18\bin\pg_dump.exe`

### CORS / запросы на `:8000` вместо `/api`

- Запускайте фронт через `npm run dev`, не открывайте собранный `dist` без настройки API.
- В dev должен быть `VITE_API_URL=/api` в `.env.development`.
- Перезапустите Vite и uvicorn после смены конфигов.

### 404 на `/api/me/dashboard`

Перезапустите backend из актуального `Backend/`. Проверьте в Swagger наличие `GET /me/dashboard`.

### Пустой список курсов у сотрудника

`GET /me/courses` возвращает только курсы с записью прогресса. Нужны назначение (`POST /courses/{id}/assign`) или старт (`POST /courses/{id}/start`). Каталог на UI собирается из `GET /courses/` + прогресс.

### `ModuleNotFoundError: psycopg`

```bash
pip install -r requirements.txt
```

Команды `python -m app.db.*` выполняйте из каталога `Backend` с активированным venv.

---

## Сборка фронта для production

```bash
cd frontend/my-dashboard
npm run build
npm run preview
```

Перед сборкой задайте `VITE_API_URL` на адрес развёрнутого API.

---

## Лицензия

Учебный / MVP-проект. Уточните условия использования у авторов репозитория.
