import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import {
  assignTraineeCourse,
  fetchJournal,
  unassignTraineeCourse,
} from '../api/journal';

const STATUS_LABELS = {
  assigned: 'Назначен',
  in_progress: 'В процессе',
  completed: 'Завершён',
  not_started: 'Не начат',
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export default function JournalPage() {
  const [data, setData] = useState({ trainees: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const journal = await fetchJournal();
      setData(journal);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить журнал');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (userId) => {
    const courseId = Number(selectedCourse[userId]);
    if (!courseId) return;

    setBusy(true);
    try {
      await assignTraineeCourse(userId, courseId);
      setSelectedCourse((prev) => ({ ...prev, [userId]: '' }));
      await load();
      setExpandedId(userId);
    } catch (err) {
      alert(err.message || 'Не удалось назначить курс');
    } finally {
      setBusy(false);
    }
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm('Снять стажёра с этого курса?')) return;

    setBusy(true);
    try {
      await unassignTraineeCourse(assignmentId);
      await load();
    } catch (err) {
      alert(err.message || 'Не удалось снять с курса');
    } finally {
      setBusy(false);
    }
  };

  const assignedCourseIds = (trainee) =>
    new Set(trainee.courses.map((c) => c.course_id));

  const availableCourses = (trainee) =>
    data.courses.filter((c) => !assignedCourseIds(trainee).has(c.id));

  const makeCorrectCourseWord = (number) => {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['курс', 'курса', 'курсов'];
    
    // Определяем нужную форму по алгоритму для русских окончаний
    const index = (number % 100 > 4 && number % 100 < 20) 
        ? 2 
        : cases[(number % 10 < 5) ? number % 10 : 5];
        
    return titles[index];
  }

  return (
    <>
      <Header title="Журнал" />
      <div className="page-content admin-page journal-page">
        <h2>Журнал стажёров</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Прогресс обучающихся и назначение на курсы. Отображаются пользователи с ролью{' '}
          <strong>student</strong>.
        </p>

        {loading && <p className="journal-muted">Загрузка…</p>}
        {error && <p className="journal-error">{error}</p>}

        {!loading && !error && data.trainees.length === 0 && (
          <div className="card">
            <p>Нет стажёров с ролью student в системе.</p>
          </div>
        )}

        {!loading && data.trainees.length > 0 && (
          <div className="journal-list">
            {data.trainees.map((trainee) => {
              const expanded = expandedId === trainee.id;
              const available = availableCourses(trainee);
              const fullName = `${trainee.first_name} ${trainee.last_name}`.trim();

              return (
                <div key={trainee.id} className="journal-card card">
                  <button
                    type="button"
                    className="journal-card-header"
                    onClick={() => setExpandedId(expanded ? null : trainee.id)}
                  >
                    <div className="journal-card-title">
                      <strong>{fullName}</strong>
                      <span>{trainee.email}</span>
                    </div>
                    <div className="journal-card-meta">
                      <span className="journal-badge">
                        {trainee.courses.length}{' '}
                        {makeCorrectCourseWord(trainee.courses.length)}
                      </span>
                      {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="journal-card-body">
                      {trainee.courses.length === 0 && (
                        <p className="journal-muted">Курсы не назначены</p>
                      )}

                      {trainee.courses.map((course) => (
                        <div key={course.assignment_id} className="journal-course-row">
                          <div className="journal-course-info">
                            <strong>{course.course_title}</strong>
                            <span className="journal-status">
                              {statusLabel(course.progress_status)} ·{' '}
                              {statusLabel(course.assignment_status)}
                            </span>
                            <div className="progress-bar" style={{ marginTop: 8, height: 8 }}>
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${course.progress_percent}%` }}
                              />
                            </div>
                            <span className="journal-progress-label">
                              {course.progress_percent}%
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-sm delete"
                            disabled={busy}
                            onClick={() => handleUnassign(course.assignment_id)}
                            title="Снять с курса"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {available.length > 0 ? (
                        <div className="journal-assign-row">
                          <select
                            value={selectedCourse[trainee.id] || ''}
                            onChange={(e) =>
                              setSelectedCourse((prev) => ({
                                ...prev,
                                [trainee.id]: e.target.value,
                              }))
                            }
                            disabled={busy}
                          >
                            <option value="">Выберите курс…</option>
                            {available.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-submit"
                            disabled={busy || !selectedCourse[trainee.id]}
                            onClick={() => handleAssign(trainee.id)}
                          >
                            <Plus size={16} style={{ marginRight: 6 }} />
                            Назначить
                          </button>
                        </div>
                      ) : (
                        <p className="journal-muted">Все курсы уже назначены</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
