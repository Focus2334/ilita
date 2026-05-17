import { createContext, useContext, useState, useCallback } from 'react';
import { defaultCourses, defaultSurveys, defaultEvents } from '../data/seedData';

const STORAGE_KEY = 'adaptator-data';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { courses: defaultCourses, surveys: defaultSurveys, events: defaultEvents };
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);

  const persist = useCallback((next) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addCourse = useCallback((course) => {
    const id = String(Date.now());
    persist({
      ...data,
      courses: [
        ...data.courses,
        {
          id,
          progress: 0,
          currentStage: 0,
          totalStages: Number(course.totalStages) || 3,
          status: 'available',
          locked: false,
          tags: [course.mandatory ? 'Обязательный' : 'Доступен', course.category],
          stages: [],
          ...course,
        },
      ],
    });
  }, [data, persist]);

  const updateCourse = useCallback((id, updates) => {
    persist({
      ...data,
      courses: data.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  }, [data, persist]);

  const deleteCourse = useCallback((id) => {
    persist({ ...data, courses: data.courses.filter((c) => c.id !== id) });
  }, [data, persist]);

  const addSurvey = useCallback((survey) => {
    const id = String(Date.now());
    const updated = data.surveys.map((s) => ({ ...s, active: false }));
    persist({
      ...data,
      surveys: [{ id, active: true, ...survey }, ...updated],
    });
  }, [data, persist]);

  const updateSurvey = useCallback((id, updates) => {
    persist({
      ...data,
      surveys: data.surveys.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  }, [data, persist]);

  const deleteSurvey = useCallback((id) => {
    persist({ ...data, surveys: data.surveys.filter((s) => s.id !== id) });
  }, [data, persist]);

  const addEvent = useCallback((event) => {
    const id = String(Date.now());
    persist({ ...data, events: [...data.events, { id, ...event }] });
  }, [data, persist]);

  const updateEvent = useCallback((id, updates) => {
    persist({
      ...data,
      events: data.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  }, [data, persist]);

  const deleteEvent = useCallback((id) => {
    persist({ ...data, events: data.events.filter((e) => e.id !== id) });
  }, [data, persist]);

  const activeSurvey = data.surveys.find((s) => s.active);
  const surveyHistory = data.surveys.filter((s) => !s.active);

  return (
    <DataContext.Provider
      value={{
        courses: data.courses,
        surveys: data.surveys,
        events: data.events,
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
