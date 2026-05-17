import { apiRequest } from './client';

/** POST /auth/login */
export function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** GET /auth/me */
export function getMe() {
  return apiRequest('/auth/me');
}
