// В dev по умолчанию /api — тот же origin, запросы проксирует Vite (см. vite.config.js).
// Прямой URL на :8000 даёт CORS: localhost:5173 ≠ 127.0.0.1:8000.
const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000');

export function getToken() {
  try {
    const raw = localStorage.getItem('adaptator-user');
    if (!raw) return null;
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

/** FastAPI редиректит /courses → /courses/ на абсолютный URL — ломает прокси и CORS */
function normalizeApiPath(path) {
  const [pathname, query = ''] = path.split('?');
  const qs = query ? `?${query}` : '';

  if (pathname === '/courses') {
    return `/courses/${qs}`;
  }
  if (pathname === '/users') {
    return `/users/${qs}`;
  }
  return path;
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${normalizeApiPath(path)}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
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
