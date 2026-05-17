import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';
import { defaultUser } from '../data/seedData';

export default function HomePage() {
  const { courses, events, activeSurvey } = useData();
  const user = defaultUser;

  const activeCourses = courses.filter(
    (c) => !c.locked && c.status !== 'completed' && c.progress < 100,
  );
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <>
      <Header title="Главная" />
      <div className="page-content">
        <div className="hero-card">
          <div className="hero-content">
            <span className="hero-badge">🔥 {user.streak} дней подряд</span>
            <h2>Привет, {user.name.split(' ')[0]}!</h2>
            <p>
              День адаптации #{user.adaptationDay}. Ты делаешь отличные успехи!
            </p>
            <div className="hero-stats">
              <div>
                <strong>{user.xp}</strong>
                <span>XP очков</span>
              </div>
              <div>
                <strong>Lvl {user.level}</strong>
                <span>Уровень</span>
              </div>
              <div>
                <strong>{user.achievements}</strong>
                <span>Достижений</span>
              </div>
            </div>
            <div className="hero-progress">
              <div className="hero-progress-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="hero-progress-label">До уровня {user.level + 1}</p>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="value">{activeCourses.length}</div>
            <div className="label">Курсов активно</div>
            <div className="sub">из {courses.length} доступных</div>
          </div>
          <div className="stat-card">
            <div className="value">24</div>
            <div className="label">Задач выполнено</div>
            <div className="sub">+3 сегодня</div>
          </div>
          <div className="stat-card">
            <div className="value">8 / 15</div>
            <div className="label">Контр. точек</div>
            <div className="sub">пройдено</div>
          </div>
          <div className="stat-card">
            <div className="value">{user.streak}</div>
            <div className="label">Серия дней</div>
            <div className="sub">дней подряд</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="section-header">
              <h3>Активные курсы</h3>
              <Link to="/courses">Все курсы ›</Link>
            </div>
            {activeCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-item-header">
                  <strong>{course.title}</strong>
                  <span>{course.progress}%</span>
                </div>
                <div
                  className="course-item-header"
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  <span>
                    Этап {course.currentStage} из {course.totalStages}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-header">
              <h3>Ближайшие задачи</h3>
            </div>
            {events.map((event) => (
              <div key={event.id} className="event-item">
                <div className={`event-dot ${event.urgent ? 'urgent' : 'normal'}`} />
                <div className="event-item-content">
                  <strong>{event.title}</strong>
                  <span>{event.category}</span>
                </div>
                <span className="event-date">{event.dateLabel}</span>
              </div>
            ))}
            {activeSurvey && (
              <Link to="/surveys">
                <button type="button" className="btn-survey">
                  Пройти опрос
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
