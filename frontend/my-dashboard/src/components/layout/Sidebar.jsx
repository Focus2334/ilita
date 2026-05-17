import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  User,
  ClipboardList,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { defaultUser } from '../../data/seedData';

const employeeNav = [
  { to: '/', icon: LayoutGrid, label: 'Главная' },
  { to: '/courses', icon: BookOpen, label: 'Курсы' },
  { to: '/profile', icon: User, label: 'Мой профиль' },
  { to: '/surveys', icon: ClipboardList, label: 'Опросы' },
  { to: '/assistant', icon: MessageCircle, label: 'Помощник' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const displayName = isAdmin ? user?.name : defaultUser.name;
  const initials = user?.initials || defaultUser.initials;
  const level = defaultUser.level;

  const navItems = isAdmin
    ? [{ to: '/admin', icon: Settings, label: 'Админ-панель' }]
    : employeeNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Адаптатор</div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
