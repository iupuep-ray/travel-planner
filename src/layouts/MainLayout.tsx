import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-lg mx-auto pb-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
