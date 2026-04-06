import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    try {
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;

        if (!user || !user.token) {
            return <Navigate to="/auth" replace />;
        }

        return children;
    } catch {
        return <Navigate to="/auth" replace />;
    }
}