import { apiRequest } from './client';

export function fetchJournal() {
  return apiRequest('/journal/');
}

export function assignTraineeCourse(userId, courseId) {
  return apiRequest(`/journal/trainees/${userId}/courses/${courseId}`, {
    method: 'POST',
  });
}

export function unassignTraineeCourse(assignmentId) {
  return apiRequest(`/journal/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
}
