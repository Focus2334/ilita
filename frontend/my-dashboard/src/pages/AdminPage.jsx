import { useState } from 'react';
import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';

const emptyCourse = {
  title: '',
  description: '',
  category: 'Введение',
  mandatory: false,
  duration: '1 час',
  xp: 100,
  totalStages: 3,
};

const emptySurvey = {
  title: 'Еженедельный опрос',
  weekRange: '',
  description: '',
  duration: '~5 минут',
  xp: 50,
  questions: 7,
};

const emptyEvent = {
  title: '',
  category: '',
  dateLabel: 'Сегодня',
  urgent: false,
};

export default function AdminPage() {
  const {
    courses,
    surveys,
    events,
    addCourse,
    updateCourse,
    deleteCourse,
    addSurvey,
    deleteSurvey,
    addEvent,
    deleteEvent,
  } = useData();

  const [tab, setTab] = useState('courses');
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [surveyForm, setSurveyForm] = useState(emptySurvey);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editId, setEditId] = useState(null);

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateCourse(editId, courseForm);
      setEditId(null);
    } else {
      addCourse(courseForm);
    }
    setCourseForm(emptyCourse);
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    addSurvey(surveyForm);
    setSurveyForm(emptySurvey);
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    addEvent(eventForm);
    setEventForm(emptyEvent);
  };

  const startEditCourse = (course) => {
    setEditId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      mandatory: course.mandatory,
      duration: course.duration,
      xp: course.xp,
      totalStages: course.totalStages,
    });
    setTab('courses');
  };

  return (
    <>
      <Header title="Админ-панель" />
      <div className="page-content admin-page">
        <h2>Управление контентом</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Добавляйте курсы, опросы и мероприятия — они сразу появятся у сотрудников.
        </p>

        <div className="admin-tabs">
          {[
            { id: 'courses', label: 'Курсы' },
            { id: 'surveys', label: 'Опросы' },
            { id: 'events', label: 'Мероприятия' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'courses' && (
          <>
            <form className="admin-form" onSubmit={handleCourseSubmit}>
              <h3>{editId ? 'Редактировать курс' : 'Добавить курс'}</h3>
              <div className="form-row-grid">
                <div className="form-field">
                  <label>Название</label>
                  <input
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Категория</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  >
                    <option>Введение</option>
                    <option>Технические</option>
                    <option>Soft Skills</option>
                  </select>
                </div>
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Описание</label>
                  <textarea
                    required
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Длительность</label>
                  <input
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>XP</label>
                  <input
                    type="number"
                    value={courseForm.xp}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, xp: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Кол-во этапов</label>
                  <input
                    type="number"
                    min={1}
                    value={courseForm.totalStages}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, totalStages: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-field checkbox-field">
                  <input
                    type="checkbox"
                    id="mandatory"
                    checked={courseForm.mandatory}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, mandatory: e.target.checked })
                    }
                  />
                  <label htmlFor="mandatory">Обязательный курс</label>
                </div>
              </div>
              <button type="submit" className="btn-submit">
                {editId ? 'Сохранить' : 'Добавить курс'}
              </button>
              {editId && (
                <button
                  type="button"
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    setEditId(null);
                    setCourseForm(emptyCourse);
                  }}
                >
                  Отмена
                </button>
              )}
            </form>
            <div className="admin-list">
              {courses.map((c) => (
                <div key={c.id} className="admin-list-item">
                  <div>
                    <strong>{c.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {c.category} · {c.duration} · +{c.xp} XP
                    </p>
                  </div>
                  <div className="admin-list-actions">
                    <button type="button" className="btn-sm edit" onClick={() => startEditCourse(c)}>
                      Изменить
                    </button>
                    <button
                      type="button"
                      className="btn-sm delete"
                      onClick={() => deleteCourse(c.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'surveys' && (
          <>
            <form className="admin-form" onSubmit={handleSurveySubmit}>
              <h3>Добавить опрос</h3>
              <div className="form-row-grid">
                <div className="form-field">
                  <label>Название</label>
                  <input
                    required
                    value={surveyForm.title}
                    onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Неделя (например: 19–23 мая 2026)</label>
                  <input
                    required
                    value={surveyForm.weekRange}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, weekRange: e.target.value })
                    }
                  />
                </div>
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Описание</label>
                  <textarea
                    required
                    value={surveyForm.description}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Длительность</label>
                  <input
                    value={surveyForm.duration}
                    onChange={(e) => setSurveyForm({ ...surveyForm, duration: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>XP</label>
                  <input
                    type="number"
                    value={surveyForm.xp}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, xp: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Вопросов</label>
                  <input
                    type="number"
                    value={surveyForm.questions}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, questions: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <button type="submit" className="btn-submit">
                Опубликовать опрос
              </button>
            </form>
            <div className="admin-list">
              {surveys.map((s) => (
                <div key={s.id} className="admin-list-item">
                  <div>
                    <strong>{s.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {s.weekRange} {s.active ? '· Активный' : '· Архив'}
                    </p>
                  </div>
                  <button type="button" className="btn-sm delete" onClick={() => deleteSurvey(s.id)}>
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'events' && (
          <>
            <form className="admin-form" onSubmit={handleEventSubmit}>
              <h3>Добавить мероприятие / задачу</h3>
              <div className="form-row-grid">
                <div className="form-field">
                  <label>Название</label>
                  <input
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Категория</label>
                  <input
                    required
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Дата (текст)</label>
                  <input
                    placeholder="Сегодня, Завтра, Чт, 20 мая"
                    value={eventForm.dateLabel}
                    onChange={(e) => setEventForm({ ...eventForm, dateLabel: e.target.value })}
                  />
                </div>
                <div className="form-field checkbox-field">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={eventForm.urgent}
                    onChange={(e) => setEventForm({ ...eventForm, urgent: e.target.checked })}
                  />
                  <label htmlFor="urgent">Срочное</label>
                </div>
              </div>
              <button type="submit" className="btn-submit">
                Добавить
              </button>
            </form>
            <div className="admin-list">
              {events.map((ev) => (
                <div key={ev.id} className="admin-list-item">
                  <div>
                    <strong>{ev.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {ev.category} · {ev.dateLabel}
                    </p>
                  </div>
                  <button type="button" className="btn-sm delete" onClick={() => deleteEvent(ev.id)}>
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
