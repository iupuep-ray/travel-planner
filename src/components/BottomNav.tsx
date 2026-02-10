import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import '@/utils/fontawesome';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { path: '/', label: '首頁', icon: 'house' },
  { path: '/schedule', label: '行程', icon: 'calendar-days' },
  { path: '/expense', label: '記帳', icon: 'wallet' },
  { path: '/planning', label: '準備', icon: 'list-check' },
  { path: '/members', label: '成員', icon: 'users' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[40px]" style={{ backgroundColor: '#7AC5AD', boxShadow: '0 -4px 12px rgba(107, 86, 58, 0.12)' }}>
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center
                w-full h-full rounded-xl
                transition-all active:scale-90
                ${isActive ? 'text-white' : 'text-white opacity-60'}
              `}
            >
              <FontAwesomeIcon
                icon={['fas', item.icon]}
                className="text-2xl mb-1"
              />
              <span className={`text-xs font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
