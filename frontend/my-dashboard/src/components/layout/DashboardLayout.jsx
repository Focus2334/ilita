import { Outlet } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import ChatPage from '../../pages/ChatPage';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <ChatProvider>
      <div className="dashboard">
        <Sidebar />
        <div className="main-area">
          <Outlet />
        </div>
        <ChatPage />
      </div>
    </ChatProvider>
  );
}
