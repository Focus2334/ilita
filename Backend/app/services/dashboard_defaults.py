"""Статические данные без таблиц в БД (опросы, мероприятия, геймификация)."""

DEFAULT_SURVEYS = [
    {
        "id": "sv1",
        "title": "Еженедельный опрос",
        "weekRange": "12–16 мая 2026",
        "description": "Расскажите о своём опыте за эту неделю. Опрос займёт ~5 минут.",
        "duration": "~5 минут",
        "xp": 50,
        "questions": 7,
        "active": True,
    },
    {
        "id": "sv2",
        "title": "Еженедельный опрос",
        "weekRange": "5–9 мая",
        "completedDate": "09 мая",
        "rating": 4.5,
        "xp": 50,
        "active": False,
    },
    {
        "id": "sv3",
        "title": "Еженедельный опрос",
        "weekRange": "28 апр – 2 мая",
        "completedDate": "02 мая",
        "rating": 5,
        "xp": 50,
        "active": False,
    },
]

DEFAULT_EVENTS = [
    {
        "id": "ev1",
        "title": "Пройти инструктаж по безопасности",
        "category": "Охрана труда",
        "dateLabel": "Сегодня",
        "urgent": True,
    },
    {
        "id": "ev2",
        "title": "Встреча с наставником",
        "category": "Адаптация",
        "dateLabel": "Завтра",
        "urgent": False,
    },
    {
        "id": "ev3",
        "title": "Презентация отдела разработки",
        "category": "Знакомство",
        "dateLabel": "Чт, 20 мая",
        "urgent": False,
    },
]

# Поля профиля без колонок в users
DEFAULT_USER_GAMIFICATION = {
    "level": 1,
    "xp": 0,
    "xpToNext": 300,
    "adaptationDay": 14,
    "adaptationTotal": 90,
    "streak": 0,
    "achievements": 0,
    "startDate": "—",
}

# Поля курса без колонок в courses
DEFAULT_COURSE_CATEGORY = "Введение"
DEFAULT_COURSE_MANDATORY = False
DEFAULT_COURSE_XP = 200
DEFAULT_COURSE_LOCKED = False
