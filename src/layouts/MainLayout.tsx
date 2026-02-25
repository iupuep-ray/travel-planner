import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  const location = useLocation();

  const statusBarColorByPath: Record<string, string> = {
    '/': '#78A153',
    '/schedule': '#FDFAF3',
    '/expense': '#8B6F47',
    '/planning': '#7AC5AD',
    '/members': '#C88EA7',
  };

  const statusBarColor = statusBarColorByPath[location.pathname] || '#E8DCC8';

  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div
          className="mx-auto md:max-w-lg"
          style={{
            backgroundColor: statusBarColor,
            height: 'var(--app-safe-top)',
          }}
        />
      </div>
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
