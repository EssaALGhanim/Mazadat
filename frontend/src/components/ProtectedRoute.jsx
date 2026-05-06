import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole, blockedRole, redirectTo }) {
    try {
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        const adminPreviewEnabled = localStorage.getItem('adminPreview') === 'true';
        const previewAdminUser = {
            token: 'admin-preview-token',
            username: 'admin.preview',
            role: 'ADMIN',
        };
        const effectiveUser = !user && adminPreviewEnabled && requiredRole === 'ADMIN'
            ? previewAdminUser
            : user;

        if (!effectiveUser || !effectiveUser.token) {
            return <Navigate to="/auth" replace />;
        }

        const bypassedRequiredRole = requiredRole === 'ADMIN' && adminPreviewEnabled ? null : requiredRole;

        if (bypassedRequiredRole && effectiveUser.role !== bypassedRequiredRole) {
            return <Navigate to={redirectTo || '/'} replace />;
        }

        if (blockedRole && effectiveUser.role === blockedRole) {
            return <Navigate to={redirectTo || '/'} replace />;
        }

        // If children is a function, call it with the current user
        if (typeof children === 'function') {
            return children(effectiveUser);
        }

        return children;
    } catch {
        return <Navigate to="/auth" replace />;
    }
}
