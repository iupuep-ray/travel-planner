import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Schedule from '@/pages/Schedule';
import Expense from '@/pages/Expense';
import Planning from '@/pages/Planning';
import Members from '@/pages/Members';
import { Tiles } from '@/components/ui/tiles';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        {/* Animated Grid Background */}
        <Tiles rows={30} cols={20} />

        <Routes>
          {/* Login Route (Public) */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="expense" element={<Expense />} />
            <Route path="planning" element={<Planning />} />
            <Route path="members" element={<Members />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
