import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('ivanov@company.ru');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>Адаптатор</h1>
          <p>
            Цифровой сервис, который поможет новым сотрудникам комфортно пройти испытательный срок, а отделу кадров и наставникам — эффективно сопровождать этот процесс.
          </p>
          {/* <div className="login-stats">
            <div className="login-stat">
              <strong>500+</strong>
              <span>Сотрудников</span>
            </div>
            <div className="login-stat">
              <strong>48</strong>
              <span>Курсов</span>
            </div>
            <div className="login-stat">
              <strong>200+</strong>
              <span>Достижений</span>
            </div>
          </div> */}
        </div>

        <div className="login-card">
          <h2>Добро пожаловать!</h2>
          <p className="subtitle">Войдите с корпоративной почтой</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Корпоративный email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivanov@company.ru"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-row">
              <label>
                <input type="checkbox" /> Запомнить меня
              </label>
              <a href="#forgot">Забыли пароль?</a>
            </div>
            <button type="submit" className="btn-primary">
              Войти
            </button>
          </form>
          <p className="login-footer">Нет доступа? Обратитесь к HR-менеджеру</p>
          <p className="login-hint">
            Вход через API бэкенда (email и пароль из БД).
          </p>
        </div>
      </div>
    </div>
  );
}
