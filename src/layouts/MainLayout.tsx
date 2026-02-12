import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="w-full pb-2">
        <div className="md:max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
