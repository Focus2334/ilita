import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  User,
  ClipboardList,
  MessageCircle,
  Settings,
  NotebookPen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const employeeNav = [
  { to: '/', icon: LayoutGrid, label: 'Главная' },
  { to: '/courses', icon: BookOpen, label: 'Курсы' },
  { to: '/profile', icon: User, label: 'Мой профиль' },
  { to: '/surveys', icon: ClipboardList, label: 'Опросы' },
  { to: '/assistant', icon: MessageCircle, label: 'Помощник' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { profile } = useData();
  const displayName = user?.name || profile?.name || 'Пользователь';
  const initials = user?.initials || profile?.initials || '?';
  const level = profile?.level ?? 1;

  const adminNav = [
    { to: '/admin', icon: Settings, label: 'Админ-панель', end: true },
    { to: '/admin/journal', icon: NotebookPen, label: 'Журнал', end: true },
  ];

  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Адаптатор</div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end ?? to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `sidebar-profile${isActive ? ' active' : ''}`}
        style={{ textDecoration: 'none', color: 'inherit' }} // Сбрасываем стандартные стили ссылки
      >
        <div className="avatar">{initials}</div>
        <div className="profile-info">
          <strong>{displayName}</strong>
          {!isAdmin && <span>Уровень {level}</span>}
          {isAdmin && <span>Администратор</span>}
        </div>
      </NavLink>

      <button type="button" className="btn-logout" onClick={logout}>
        Выйти
      </button>
    </aside>
  );
}
