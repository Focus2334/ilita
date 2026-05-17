import { apiRequest } from './client';

/** GET /me/dashboard */
export function getDashboard() {
  return apiRequest('/me/dashboard');
}
