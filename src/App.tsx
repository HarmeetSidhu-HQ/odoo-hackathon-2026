import { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Navbar } from './components/layout/Navbar';
import { Employees } from './pages/Employees';
import { Attendance } from './pages/Attendance';
import { TimeOff } from './pages/TimeOff';
import { ProfileModal } from './components/profile/ProfileModal';

export function App() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentTab, setCurrentTab] = useState<'employees' | 'attendance' | 'timeoff'>('employees');

  if (!isAuthenticated || !currentUser) {
    if (authView === 'signup') {
      return <SignUp onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateToSignUp={() => setAuthView('signup')} />;
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col antialiased selection:bg-brand-600/30 selection:text-brand-100">
      {/* Global Persisted Navbar with Systray */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'employees' && <Employees />}
        {currentTab === 'attendance' && <Attendance />}
        {currentTab === 'timeoff' && <TimeOff />}
      </main>

      {/* Profile Modal */}
      <ProfileModal />
    </div>
  );
}

export default App;
