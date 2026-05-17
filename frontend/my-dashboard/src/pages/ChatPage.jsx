import React, { useState } from 'react';
import '../index.css'; // Подключаем стили

export default function ChatWidget() {
  // Состояние для отслеживания открыт чат или закрыт
  const [isOpen, setIsOpen] = useState(false);

  // Функция переключения состояния
  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="chat-widget-wrapper">
      {/* Выдвижное окно чата */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h4>Чат поддержки</h4>
          <button className="close-btn" onClick={toggleChat}>&times;</button>
        </div>
        <div className="chat-body">
          <p>Чем мы можем вам помочь сегодня?</p>
        </div>
        <div className="chat-footer">
          <input type="text" placeholder="Введите сообщение..." />
          <button>Отправить</button>
        </div>
      </div>

      {/* Кнопка открытия/закрытия */}
      <button className="chat-toggle-btn" onClick={toggleChat}>
        {isOpen ? '❌' : '💬'}
      </button>
    </div>
  );
}
