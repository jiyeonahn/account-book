// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/main" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage/>
                </PublicRoute>
            } />
            <Route path="/main" element={
                <ProtectedRoute>
                    <DashboardPage/>
                </ProtectedRoute>
            } />
            {/* 필요 시 다른 라우트 추가 */}
            <Route path="*" element={<Navigate to="/main" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
