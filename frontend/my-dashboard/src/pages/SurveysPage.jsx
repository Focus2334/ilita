import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function SurveysPage() {
  const { activeSurvey, surveyHistory } = useData();

  return (
    <>
      <Header title="Опросы" />
      <div className="page-content">
        {activeSurvey ? (
          <div className="survey-active">
            <div>
              <h3>{activeSurvey.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
                Неделя: {activeSurvey.weekRange}
              </p>
              <p>{activeSurvey.description}</p>
              <div className="survey-active-meta">
                <span>{activeSurvey.duration}</span>
                <span className="xp">+{activeSurvey.xp} XP</span>
                <span>{activeSurvey.questions} вопросов</span>
              </div>
            </div>
            <button type="button" className="btn-orange">
              Пройти опрос ›
            </button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24 }}>
            <p>Нет активных опросов</p>
          </div>
        )}

        <div className="card">
          <div className="section-header">
            <h3>История опросов</h3>
          </div>
          {surveyHistory.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>История пуста</p>
          )}
          {surveyHistory.map((s) => (
            <div key={s.id} className="history-item">
              <div>
                <strong>Неделя: {s.weekRange}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Пройден {s.completedDate}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {s.rating && <Stars rating={s.rating} />}
                {s.rating && (
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{s.rating}</div>
                )}
                <div style={{ color: 'var(--orange)', fontSize: '0.85rem' }}>+{s.xp} XP</div>
              </div>
            </div>
          ))}

          {activeSurvey && (
            <div className="streak-alert">
              <strong>Серия опросов: 2 недели!</strong>
              <p style={{ fontSize: '0.9rem', marginTop: 4 }}>
                Пройдите этот опрос, чтобы продолжить серию и разблокировать достижение
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
