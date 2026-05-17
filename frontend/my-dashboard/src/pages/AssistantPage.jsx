import { MessageCircle } from 'lucide-react';
import Header from '../components/layout/Header';

export default function AssistantPage() {
  return (
    <>
      <Header title="Помощник" />
      <div className="page-content">
        <div className="card placeholder-page">
          <MessageCircle size={64} />
          <h2>Раздел в разработке</h2>
          <p>Корпоративный помощник скоро будет доступен.</p>
        </div>
      </div>
    </>
  );
}
