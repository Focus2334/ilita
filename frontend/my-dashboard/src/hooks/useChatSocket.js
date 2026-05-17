import { useEffect, useRef } from 'react';
import { getChatWebSocketUrl } from '../api/chat';

export function useChatSocket(enabled, onMessage) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return undefined;

    const url = getChatWebSocketUrl();
    if (!url) return undefined;

    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch {
        /* ignore */
      }
    };

    return () => {
      socket.close();
    };
  }, [enabled]);
}
