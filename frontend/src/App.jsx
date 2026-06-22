import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppContent() {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return (
            <main className="app-loader" aria-label="Loading TaskFlow">
                <div className="brand-mark"><span /></div>
                <div className="loader-line"><span /></div>
            </main>
        );
    }

    return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
