import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Lock } from 'lucide-react';
import Header from '../components/layout/Header';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { getActionButton } from '../utils/courseHelpers';

const taskBtnClass = {
  video: 'video',
  article: 'article',
  task: 'task',
  test: 'test',
};

const taskLabels = {
  video: 'Видео',
  article: 'Статья',
  task: 'Задание',
  test: 'Тест',
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const { course, loading, error, startCourse, completeTask } = useCourseDetail(id);
  const [expandedStage, setExpandedStage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <>
        <Header title="Курс" />
        <div className="page-content">
          <p>Загрузка…</p>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header title="Курс" />
        <div className="page-content">
          <p>{error || 'Курс не найден.'}</p>
          <Link to="/courses">← Назад к курсам</Link>
        </div>
      </>
    );
  }

  const stages = course.stages || [];
  const completedStages = stages.filter((s) => s.status === 'completed').length;
  const completedTasks = stages
    .flatMap((s) => s.tasks || [])
    .filter((t) => t.done).length;
  const totalTasks = stages.flatMap((s) => s.tasks || []).length;
  const action = getActionButton(course);

  const handlePrimaryAction = async () => {
    setActionLoading(true);
    try {
      if (course.status === 'available') {
        await startCourse();
      }
    } catch (err) {
      alert(err.message || 'Не удалось начать курс');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskStart = async (task) => {
    if (task.done || !task.pageId) return;
    setActionLoading(true);
    try {
      await completeTask(id, task.pageId);
    } catch (err) {
      alert(err.message || 'Не удалось отметить прогресс');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Header title="Курсы" />
      <div className="page-content">
        <Link to="/courses" className="back-link">
          <ArrowLeft size={16} /> Назад к курсам
        </Link>

        <div className="course-banner">
          <div className="course-banner-progress">{course.progress}%</div>
          <div className="course-banner-tags">
            {course.mandatory && <span className="tag red">Обязательный</span>}
            <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              {course.category}
            </span>
          </div>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <div className="course-banner-meta">
            <span>~{course.duration}</span>
            <span>+{course.xp} XP</span>
            <span>{course.totalStages} этапа</span>
          </div>
          {action && course.status === 'available' && (
            <button
              type="button"
              className={`btn-action ${action.color}`}
              style={{ marginTop: 16 }}
              disabled={actionLoading}
              onClick={handlePrimaryAction}
            >
              {actionLoading ? 'Загрузка…' : action.label}
            </button>
          )}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="value">
              {completedStages} / {course.totalStages}
            </div>
            <div className="label">Этапов</div>
          </div>
          <div className="stat-card">
            <div className="value">
              {totalTasks ? `${completedTasks} / ${totalTasks}` : '—'}
            </div>
            <div className="label">Задач</div>
          </div>
          <div className="stat-card">
            <div className="value">{course.progress}%</div>
            <div className="label">Прогресс</div>
          </div>
          <div className="stat-card">
            <div className="value">
              {course.status === 'completed'
                ? 'Завершён'
                : course.status === 'in_progress'
                  ? 'В процессе'
                  : 'Доступен'}
            </div>
            <div className="label">Статус</div>
          </div>
        </div>

        {stages.length > 0 && (
          <>
            <h3 style={{ marginBottom: 16 }}>Этапы курса</h3>
            <div className="stage-stepper">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`stage-step${
                    stage.status === 'completed'
                      ? ' done'
                      : stage.status === 'current'
                        ? ' current'
                        : ''
                  }`}
                >
                  <div className="stage-step-dot" />
                  <span>
                    {stage.title}
                    {stage.progress > 0 && stage.status !== 'locked'
                      ? ` (${stage.progress}%)`
                      : ''}
                    {stage.status === 'current' ? ' (В процессе)' : ''}
                    {stage.status === 'locked' ? ' (Заблокирован)' : ''}
                  </span>
                </div>
              ))}
            </div>

            {stages.map((stage) => {
              const isExpanded = expandedStage === stage.id;
              const circleClass =
                stage.status === 'completed'
                  ? ''
                  : stage.status === 'current'
                    ? 'blue'
                    : 'gray';

              return (
                <div key={stage.id} className="stage-item">
                  <div
                    className="stage-header"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      stage.status !== 'locked' &&
                      setExpandedStage(isExpanded ? null : stage.id)
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      stage.status !== 'locked' &&
                      setExpandedStage(isExpanded ? null : stage.id)
                    }
                  >
                    <div className="stage-header-left">
                      {stage.status === 'locked' ? (
                        <Lock size={20} color="#9ca3af" />
                      ) : (
                        <div className={`stage-progress-circle ${circleClass}`}>
                          {stage.progress}%
                        </div>
                      )}
                      <div>
                        <strong>{stage.title}</strong>
                        <div style={{ marginTop: 4 }}>
                          {stage.status === 'completed' && (
                            <span className="tag green">Завершён</span>
                          )}
                          {stage.status === 'current' && (
                            <span className="tag blue">Текущий</span>
                          )}
                          {stage.status === 'locked' && (
                            <span className="tag gray">Заблокирован</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {stage.status !== 'locked' && <ChevronDown size={20} />}
                  </div>

                  {isExpanded && stage.tasks && (
                    <div className="stage-body">
                      <p style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Задачи (
                        {stage.tasks.filter((t) => t.done).length}/{stage.tasks.length} выполнено)
                      </p>
                      {stage.tasks.map((task) => (
                        <div key={task.id} className={`task-row${task.done ? ' done' : ''}`}>
                          <div>
                            <strong>{task.title}</strong>
                            <div className="task-type">{taskLabels[task.type]}</div>
                          </div>
                          <button
                            type="button"
                            className={`btn-task ${taskBtnClass[task.type]}`}
                            disabled={task.done || actionLoading}
                            onClick={() => handleTaskStart(task)}
                          >
                            {task.done ? 'Готово' : 'Начать'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {stages.length === 0 && (
          <div className="card">
            <p>Этапы курса будут добавлены администратором.</p>
          </div>
        )}
      </div>
    </>
  );
}
