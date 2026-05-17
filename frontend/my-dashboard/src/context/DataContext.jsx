import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiRequest, parseDurationDays } from '../api/client';
import { useAuth } from './AuthContext';

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
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!user?.token) {
      setData(emptyData);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest('/me/dashboard');
      setData({
        courses: payload.courses || [],
        surveys: payload.surveys || [],
        events: payload.events || [],
        user: payload.user || null,
      });
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addCourse = useCallback(
    async (course) => {
      await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          duration_days: parseDurationDays(course.duration),
        }),
      });
      await reload();
    },
    [reload],
  );

  const updateCourse = useCallback(
    async (id, updates) => {
      await apiRequest(`/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          duration_days: parseDurationDays(updates.duration),
        }),
      });
      await reload();
    },
    [reload],
  );

  const deleteCourse = useCallback(
    async (id) => {
      await apiRequest(`/courses/${id}`, { method: 'DELETE' });
      await reload();
    },
    [reload],
  );

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

  const updateSurvey = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) => (s.id === id ? { ...s, ...updates } : s)),
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

  const updateEvent = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
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
        error,
        reload,
        activeSurvey,
        surveyHistory,
        addCourse,
        updateCourse,
        deleteCourse,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        addEvent,
        updateEvent,
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
