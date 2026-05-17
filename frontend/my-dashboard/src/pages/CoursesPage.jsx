import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock } from 'lucide-react';
import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';
import { getTagClass, getActionButton } from '../utils/courseHelpers';

const FILTERS = ['Все', 'Обязательные', 'Введение', 'Технические', 'Soft Skills'];

export default function CoursesPage() {
  const { courses, profile, coursesLoading, loadCourses } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Все');

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'Все' ||
        (filter === 'Обязательные' && c.mandatory) ||
        c.category === filter;
      return matchSearch && matchFilter;
    });
  }, [courses, search, filter]);

  const completed = courses.filter((c) => c.status === 'completed' || c.progress >= 100).length;
  const totalXp = courses.reduce((s, c) => s + (c.xp || 0), 0);
  const earnedXp = courses
    .filter((c) => c.progress > 0)
    .reduce((s, c) => s + Math.round(((c.xp || 0) * c.progress) / 100), 0);
  const mandatoryDone = courses.filter((c) => c.mandatory && c.progress >= 100).length;
  const mandatoryTotal = courses.filter((c) => c.mandatory).length;
  const avgProgress = Math.round(
    courses.reduce((s, c) => s + c.progress, 0) / Math.max(courses.length, 1),
  );

  if (coursesLoading && courses.length === 0) {
    return (
      <>
        <Header title="Курсы" />
        <div className="page-content">
          <p>Загрузка…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Курсы" />
      <div className="page-content">
        <div className="stat-grid cols-3">
          <div className="stat-card">
            <div className="value">
              {completed} / {courses.length}
            </div>
            <div className="label">курсов завершено</div>
          </div>
          <div className="stat-card">
            <div className="value">
              {earnedXp} из {totalXp}
            </div>
            <div className="label">возможных XP</div>
          </div>
          <div className="stat-card">
            <div className="value">
              {mandatoryDone} / {mandatoryTotal}
            </div>
            <div className="label">обязательных курсов</div>
          </div>
        </div>

        <div className="card adaptation-card">
          <h3>Общий прогресс адаптации</h3>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${avgProgress}%` }} />
          </div>
          <div className="adaptation-meta">
            <span>
              День {profile?.adaptationDay ?? 14} из {profile?.adaptationTotal ?? 90}
            </span>
            <span>Ожидаемое завершение: 31 июля 2026</span>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск курсов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="course-grid">
          {filtered.map((course) => {
            const action = getActionButton(course);
            return (
              <div key={course.id} className={`course-card${course.locked ? ' locked' : ''}`}>
                <div className="course-card-tags">
                  {(course.tags || []).map((tag) => (
                    <span key={tag} className={`tag ${getTagClass(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h4>{course.title}</h4>
                <p>{course.description}</p>
                {!course.locked && (
                  <div className="course-card-progress">
                    <div className="course-card-progress-meta">
                      <span>
                        Этап {course.currentStage} из {course.totalStages}
                      </span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="course-card-footer">
                  {course.locked ? (
                    <span className="lock-msg">
                      <Lock size={14} />
                      {course.unlockRequirement}
                    </span>
                  ) : (
                    <>
                      <span>
                        {course.duration} +{course.xp} XP
                      </span>
                      {action && (
                        <Link to={`/courses/${course.id}`}>
                          <button
                            type="button"
                            className={`btn-action ${action.color}`}
                          >
                            {action.label}
                          </button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
