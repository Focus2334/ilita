import { apiRequest, parseDurationDays } from './client';

/** GET /courses */
export function listCourses() {
  return apiRequest('/courses');
}

/** GET /me/courses */
export function listMyCoursesProgress() {
  return apiRequest('/me/courses');
}

/** GET /courses/{courseId} */
export function getCourse(courseId) {
  return apiRequest(`/courses/${courseId}`);
}

/** GET /courses/{courseId}/progress */
export function getCourseProgress(courseId) {
  return apiRequest(`/courses/${courseId}/progress`);
}

/** POST /courses/{courseId}/start */
export function startCourse(courseId) {
  return apiRequest(`/courses/${courseId}/start`, { method: 'POST' });
}

/** POST /courses/{courseId}/pages/{pageId}/view */
export function markPageViewed(courseId, pageId) {
  return apiRequest(`/courses/${courseId}/pages/${pageId}/view`, {
    method: 'POST',
  });
}

/** POST /courses — admin/hr */
export function createCourse({ title, description, duration }) {
  return apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description: description || null,
      duration_days: parseDurationDays(duration),
    }),
  });
}

/** PATCH /courses/{courseId} — admin/hr */
export function updateCourse(courseId, { title, description, duration }) {
  return apiRequest(`/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
      description,
      duration_days: parseDurationDays(duration),
    }),
  });
}

/** DELETE /courses/{courseId} — admin/hr */
export function deleteCourse(courseId) {
  return apiRequest(`/courses/${courseId}`, { method: 'DELETE' });
}

/** POST /courses/{courseId}/assign */
export function assignCourse(courseId, userId) {
  return apiRequest(`/courses/${courseId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

/** GET /courses/users/{userId}/assignments */
export function listUserAssignments(userId) {
  return apiRequest(`/courses/users/${userId}/assignments`);
}
