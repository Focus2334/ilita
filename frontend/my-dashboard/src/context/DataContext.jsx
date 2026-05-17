import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getMe } from '../api/auth';
import { getDashboard } from '../api/dashboard';
import * as coursesApi from '../api/courses';
import { mapAdminCourses, mergeCatalogWithProgress } from '../api/courseMappers';
import { useAuth } from './AuthContext';

function profileFromMe(me) {
  const name = `${me.first_name} ${me.last_name}`.trim();
  return {
    name,
    initials: `${me.first_name?.[0] || ''}${me.last_name?.[0] || ''}`.toUpperCase(),
    email: me.email,
    level: 1,
    xp: 0,
    xpToNext: 200,
    adaptationDay: 1,
    adaptationTotal: 90,
    streak: 0,
    achievements: 0,
    startDate: new Date().toLocaleDateString('ru-RU'),
  };
}

const DataContext = createContext(null);

const emptyData = {
  courses: [],
  surveys: [],
  events: [],
  user: null,
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /me/dashboard — профиль, опросы, события */
  const reload = useCallback(async () => {
    if (!user?.token) {
      setData(emptyData);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = await getDashboard();
      setData((prev) => ({
        ...prev,
        surveys: payload.surveys || [],
        events: payload.events || [],
        user: payload.user || null,
      }));
    } catch (err) {
      if (err.status === 404) {
        const me = await getMe();
        setData((prev) => ({
          ...prev,
          surveys: [],
          events: [],
          user: profileFromMe(me),
        }));
      } else {
        setError(err.message || 'Не удалось загрузить данные');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  /** GET /courses + GET /me/courses (сотрудник) или GET /courses (админ) */
  const loadCourses = useCallback(async () => {
    if (!user?.token) {
      setData((prev) => ({ ...prev, courses: [] }));
      return;
    }

    setCoursesLoading(true);
    try {
      if (user.role === 'admin') {
        const catalog = await coursesApi.listCourses();
        setData((prev) => ({ ...prev, courses: mapAdminCourses(catalog) }));
      } else {
        const [catalog, progress] = await Promise.all([
          coursesApi.listCourses(),
          coursesApi.listMyCoursesProgress(),
        ]);
        setData((prev) => ({
          ...prev,
          courses: mergeCatalogWithProgress(catalog, progress),
        }));
      }
    } catch (err) {
      setError(err.message || 'Не удалось загрузить курсы');
    } finally {
      setCoursesLoading(false);
    }
  }, [user?.token, user?.role]);

  useEffect(() => {
    reload();
    loadCourses();
  }, [reload, loadCourses]);

  const addCourse = useCallback(
    async (course) => {
      await coursesApi.createCourse({
        title: course.title,
        description: course.description,
        duration: course.duration,
      });
      await loadCourses();
    },
    [loadCourses],
  );

  const updateCourse = useCallback(
    async (id, updates) => {
      await coursesApi.updateCourse(id, {
        title: updates.title,
        description: updates.description,
        duration: updates.duration,
      });
      await loadCourses();
    },
    [loadCourses],
  );

  const deleteCourse = useCallback(
    async (id) => {
      await coursesApi.deleteCourse(id);
      await loadCourses();
    },
    [loadCourses],
  );

  // Опросы и мероприятия: в API только моки внутри GET /me/dashboard, отдельных эндпоинтов нет
  const addSurvey = useCallback((survey) => {
    const id = String(Date.now());
    setData((prev) => ({
      ...prev,
      surveys: [
        { id, active: true, ...survey },
        ...prev.surveys.map((s) => ({ ...s, active: false })),
      ],
    }));
  }, []);

  const deleteSurvey = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      surveys: prev.surveys.filter((s) => s.id !== id),
    }));
  }, []);

  const addEvent = useCallback((event) => {
    const id = String(Date.now());
    setData((prev) => ({
      ...prev,
      events: [...prev.events, { id, ...event }],
    }));
  }, []);

  const deleteEvent = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }, []);

  const activeSurvey = data.surveys.find((s) => s.active);
  const surveyHistory = data.surveys.filter((s) => !s.active);

  return (
    <DataContext.Provider
      value={{
        courses: data.courses,
        surveys: data.surveys,
        events: data.events,
        profile: data.user,
        loading,
        coursesLoading,
        error,
        reload,
        loadCourses,
        activeSurvey,
        surveyHistory,
        addCourse,
        updateCourse,
        deleteCourse,
        addSurvey,
        deleteSurvey,
        addEvent,
        deleteEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
