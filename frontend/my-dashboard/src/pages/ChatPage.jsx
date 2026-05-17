import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import {
  fetchConversations,
  fetchMessages,
  fetchUsers,
  markConversationRead,
  sendMessage,
} from '../api/chat';
import { useChatSocket } from '../hooks/useChatSocket';

function partnerName(partner) {
  if (!partner) return '';
  return `${partner.first_name} ${partner.last_name}`.trim();
}

function partnerInitials(partner) {
  if (!partner) return '?';
  return `${partner.first_name?.[0] || ''}${partner.last_name?.[0] || ''}`.toUpperCase();
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatPage() {
  const { isOpen, closeChat } = useChat();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const list = await fetchUsers();
      setUsers(list.filter((u) => u.id !== user?.id));
    } catch {
      /* список пользователей опционален */
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (partnerId) => {
    setLoadingMessages(true);
    try {
      const list = await fetchMessages(partnerId);
      setMessages(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectPartner = useCallback(
    async (partner) => {
      setActivePartner(partner);
      await loadMessages(partner.id);
      try {
        await markConversationRead(partner.id);
        loadConversations();
      } catch {
        /* ignore */
      }
    },
    [loadMessages, loadConversations],
  );

  const handleSocketMessage = useCallback(
    (payload) => {
      if (payload.type === 'message') {
        loadConversations();
        if (
          activePartner &&
          (payload.sender_id === activePartner.id ||
            payload.recipient_id === activePartner.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
          if (payload.sender_id === activePartner.id) {
            markConversationRead(activePartner.id).then(() => loadConversations());
          }
        }
      }
    },
    [activePartner, loadConversations],
  );

  useChatSocket(isOpen, handleSocketMessage);

  useEffect(() => {
    if (!isOpen) return;
    loadConversations();
    loadUsers();
  }, [isOpen, loadConversations, loadUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartner]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activePartner || sending) return;

    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(activePartner.id, text);
      setMessages((prev) => [...prev, msg]);
      setDraft('');
      loadConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const conversationPartners = conversations.map((c) => c.partner);
  const usersWithoutChat = users.filter(
    (u) => !conversationPartners.some((p) => p.id === u.id),
  );

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="chat-overlay"
        aria-label="Закрыть чат"
        onClick={closeChat}
      />
      <div className="chat-panel" role="dialog" aria-label="Сообщения">
        <div className={`chat-panel-inner${activePartner ? ' thread-open' : ''}`}>
          <aside className="chat-sidebar">
            <div className="chat-panel-header">
              <h4>Сообщения</h4>
              <button type="button" className="close-btn" onClick={closeChat} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="chat-sidebar-body">
              {loadingList && <p className="chat-muted">Загрузка…</p>}
              {error && <p className="chat-error">{error}</p>}

              {conversations.map((conv) => (
                <button
                  key={conv.partner.id}
                  type="button"
                  className={`chat-contact${activePartner?.id === conv.partner.id ? ' active' : ''}`}
                  onClick={() => selectPartner(conv.partner)}
                >
                  <span className="chat-contact-avatar">{partnerInitials(conv.partner)}</span>
                  <span className="chat-contact-info">
                    <span className="chat-contact-name">{partnerName(conv.partner)}</span>
                    <span className="chat-contact-preview">
                      {conv.last_message?.content || 'Нет сообщений'}
                    </span>
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="chat-unread">{conv.unread_count}</span>
                  )}
                </button>
              ))}

              {usersWithoutChat.length > 0 && (
                <>
                  <p className="chat-section-label">Написать пользователю</p>
                  {usersWithoutChat.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={`chat-contact${activePartner?.id === u.id ? ' active' : ''}`}
                      onClick={() =>
                        selectPartner({
                          id: u.id,
                          first_name: u.first_name,
                          last_name: u.last_name,
                        })
                      }
                    >
                      <span className="chat-contact-avatar">{partnerInitials(u)}</span>
                      <span className="chat-contact-name">{partnerName(u)}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </aside>

          <section className="chat-main">
            {!activePartner ? (
              <div className="chat-empty">
                <p>Выберите диалог или пользователя слева</p>
              </div>
            ) : (
              <>
                <div className="chat-panel-header chat-thread-header">
                  <button
                    type="button"
                    className="chat-back-mobile"
                    onClick={() => setActivePartner(null)}
                    aria-label="Назад"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span className="chat-contact-avatar sm">{partnerInitials(activePartner)}</span>
                  <h4>{partnerName(activePartner)}</h4>
                </div>

                <div className="chat-messages">
                  {loadingMessages && <p className="chat-muted">Загрузка сообщений…</p>}
                  {messages.map((msg) => {
                    const mine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-row${mine ? ' mine' : ''}`}
                      >
                        <div className={`chat-bubble${mine ? ' mine' : ''}`}>
                          <p>{msg.content}</p>
                          <time>{formatTime(msg.timestamp)}</time>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-compose" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder="Сообщение…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !draft.trim()} aria-label="Отправить">
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
