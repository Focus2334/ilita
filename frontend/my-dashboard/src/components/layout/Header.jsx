import { Bell } from 'lucide-react';
import { MessageCircleMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function Header({ title }) {
  const { user } = useAuth();
  const { profile } = useData();
  const navigate = useNavigate();
  const initials = user?.initials || profile?.initials || '?';

  return (
    <header className="page-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <button type="button" aria-label="Уведомления">
          <Bell size={22} />
        </button>
        <button type="button" aria-label="Уведомления">
          <MessageCircleMore size={22} />
        </button>
        <div 
          className="avatar" 
          onClick={() => navigate('/profile')} 
          style={{ cursor: 'pointer' }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
