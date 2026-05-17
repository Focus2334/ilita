/** Пустая строка = тот же хост (фронт с :8000 или Vite proxy в dev). */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getToken() {
  try {
    const raw = localStorage.getItem('adaptator-user');
    if (!raw) return null;
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = 'Ошибка запроса';
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    const error = new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail),
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function parseDurationDays(duration) {
  if (!duration) return 7;
  const match = String(duration).match(/(\d+)/);
  if (!match) return 7;
  const value = Number(match[1]);
  if (duration.toLowerCase().includes('час')) {
    return Math.max(1, Math.ceil(value / 2));
  }
  return Math.max(1, value);
}
