import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoaderGrid from '@/components/ui/loader-grid';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, memberExists } = useAuth();

  if (loading) {
    // 載入中畫面（顯示在格線上方）
    return (
      <div className="min-h-screen flex items-center justify-center relative z-50">
        <div className="text-center">
          <div className="text-[3rem] mb-6 flex justify-center">
            <LoaderGrid />
          </div>
          <p className="text-brown opacity-60 font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user || !memberExists) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
