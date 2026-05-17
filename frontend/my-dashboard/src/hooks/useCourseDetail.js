import { useCallback, useEffect, useState } from 'react';
import * as coursesApi from '../api/courses';
import { mapCourseDetail } from '../api/courseMappers';

export function useCourseDetail(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    try {
      const [detail, progress] = await Promise.all([
        coursesApi.getCourse(courseId),
        coursesApi.getCourseProgress(courseId),
      ]);
      setCourse(mapCourseDetail(detail, progress));
    } catch (err) {
      setError(err.message || 'Не удалось загрузить курс');
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCourse = useCallback(async () => {
    const progress = await coursesApi.startCourse(courseId);
    const detail = await coursesApi.getCourse(courseId);
    setCourse(mapCourseDetail(detail, progress));
  }, [courseId]);

  const completeTask = useCallback(
    async (courseIdParam, pageId) => {
      const progress = await coursesApi.markPageViewed(courseIdParam, pageId);
      const detail = await coursesApi.getCourse(courseIdParam);
      setCourse(mapCourseDetail(detail, progress));
    },
    [],
  );

  return { course, loading, error, refresh, startCourse, completeTask };
}
