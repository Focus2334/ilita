import { apiRequest, getToken } from './client';

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '/api' : '');

export function getChatWebSocketUrl() {
  const token = getToken();
  if (!token) return null;

  const path = `${API_BASE}/ws/chat?token=${encodeURIComponent(token)}`;

  if (path.startsWith('http')) {
    return path.replace(/^http/, 'ws');
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
}

export function fetchConversations() {
  return apiRequest('/chat/conversations');
}

export function fetchMessages(partnerId, params = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.before_id) qs.set('before_id', String(params.before_id));
  const query = qs.toString();
  return apiRequest(
    `/chat/conversations/${partnerId}/messages${query ? `?${query}` : ''}`,
  );
}

export function sendMessage(partnerId, content) {
  return apiRequest(`/chat/conversations/${partnerId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function markConversationRead(partnerId) {
  return apiRequest(`/chat/conversations/${partnerId}/read`, {
    method: 'PATCH',
  });
}

export function fetchUsers() {
  return apiRequest('/users/');
}
