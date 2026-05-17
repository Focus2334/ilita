import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';

const achievements = [
  { title: 'Быстрый старт', desc: 'Завершите первый курс за 3 дня' },
  { title: 'Коммуникатор', desc: 'Пройдите курс по коммуникации' },
  { title: 'Меткий стрелок', desc: '100% в тесте с первой попытки' },
  { title: 'Неудержимый', desc: 'Серия 7 дней подряд' },
  { title: 'Чемпион', desc: 'Достигните 10 уровня' },
  { title: 'Книжный червь', desc: 'Прочитайте 20 статей' },
  { title: 'Командный игрок', desc: 'Участвуйте в 3 мероприятиях' },
];

const levels = [
  { n: 1, name: 'Новичок', xp: 0 },
  { n: 2, name: 'Стажёр', xp: 200 },
  { n: 3, name: 'Ученик', xp: 500 },
  { n: 4, name: 'Практик', xp: 900 },
  { n: 5, name: 'Специалист', xp: 1400 },
  { n: 6, name: 'Эксперт', xp: 2000 },
  { n: 7, name: 'Профи', xp: 2700 },
  { n: 8, name: 'Мастер', xp: 3500 },
  { n: 9, name: 'Чемпион', xp: 4500 },
  { n: 10, name: 'Легенда', xp: 5500 },
];

export default function ProfilePage() {
  const { courses, profile, loading } = useData();
  const user = profile;

  if (loading || !user) {
    return (
      <>
        <Header title="Мой профиль" />
        <div className="page-content">
          <p>Загрузка…</p>
        </div>
      </>
    );
  }

  const xpPercent = user.xpToNext
    ? Math.round((user.xp / user.xpToNext) * 100)
    : 0;

  const completedCourses = courses.filter(
    (c) => c.status === 'completed' || c.progress >= 95,
  );

  return (
    <>
      <Header title="Мой профиль" />
      <div className="page-content">
        <div className="card">
          <div className="profile-top">
            <div className="avatar lg">{user.initials}</div>
            <div>
              <h2>{user.name}</h2>
              <p>Стажёр с {user.startDate}</p>
            </div>
          </div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-labels">
              <span>Прогресс до уровня {user.level + 1}</span>
              <span>
                {user.xp} / {user.xpToNext} XP
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="xp-bar-labels" style={{ marginTop: 8 }}>
              <span>Уровень {user.level}</span>
              <span>Уровень {user.level + 1}</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="card">
            <div className="section-header">
              <h3>Достижения</h3>
              <span style={{ color: 'var(--text-muted)' }}>7/12</span>
            </div>
            <div className="achievements-grid">
              {achievements.map((a) => (
                <div key={a.title} className="achievement-card">
                  {/* Вставляем выбранную вами картинку награды */}
                  <img 
                    src="https://avatars.mds.yandex.net/i?id=8c340594547011840db6fce8f36c14c04dcb5a0f-5232207-images-thumbs&n=13" 
                    alt={a.title}
                    className="achievement-img"
                  />
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Путь уровней</h3>
            <div className="level-path">
              {levels.map((lvl) => {
                const state =
                  lvl.n < user.level ? 'done' : lvl.n === user.level ? 'current' : 'locked';
                return (
                  <div key={lvl.n} className={`level-item ${state}`}>
                    <div className="level-icon">
                      {state === 'done' ? '✓' : state === 'current' ? '★' : '🔒'}
                    </div>
                    <span style={state === 'current' ? { color: 'var(--orange)', fontWeight: 600 } : {}}>
                      {lvl.n}. {lvl.name}
                    </span>
                    <span className="level-xp">{lvl.xp} XP</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Завершённые курсы</h3>
          {completedCourses.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>Пока нет завершённых курсов</p>
          )}
          {completedCourses.map((c) => (
            <div key={c.id} className="completed-course">
              <div>
                <strong>{c.title}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {c.completedDate || 'Недавно'}
                </p>
              </div>
              <strong style={{ color: 'var(--green)' }}>{c.progress}%</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
