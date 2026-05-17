import { Bell, MessageCircleMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useData } from '../../context/DataContext';

export default function Header({ title }) {
  const { user } = useAuth();
  const { profile } = useData();
  const { openChat, isOpen } = useChat();
  const navigate = useNavigate();
  const initials = user?.initials || profile?.initials || '?';

  return (
    <header className="page-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <button type="button" id="notifications-button" aria-label="Уведомления">
          <Bell size={22} />
        </button>
        <button
          type="button"
          id="messages-button"
          className={isOpen ? 'active' : ''}
          aria-label="Сообщения"
          aria-expanded={isOpen}
          onClick={openChat}
        >
          <MessageCircleMore size={22} />
        </button>
        <div
          className="avatar"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
