import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  );
}
