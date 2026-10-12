import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Spinner } from './components/ui';

// Pages
import { DashboardPage } from './pages/Dashboard';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ProjectsListPage } from './pages/ProjectsList';
import { ProjectDetailPage } from './pages/ProjectDetail';
import { ProjectEditorPage } from './pages/ProjectEditor';
import { PublicProfilePage } from './pages/PublicProfile';
import { ProfileSettingsPage } from './pages/ProfileSettings';
import { CollectionsPage } from './pages/Collections';
import { AnalyticsPage } from './pages/Analytics';
import { DiscoverPage } from './pages/Discover';
import { SharedProjectPage } from './pages/SharedProject';
import { AccountSettingsPage } from './pages/AccountSettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold text-zinc-900">404</h1>
      <p className="text-sm text-zinc-500 mt-2">The requested page does not exist.</p>
      <a
        href="/"
        className="mt-6 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white"
      >
        Return to Home
      </a>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-zinc-50/30 text-zinc-900 antialiased selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public / Semi-Public Routes */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/p/:username" element={<PublicProfilePage />} />
                <Route path="/shared/:token" element={<SharedProjectPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />

                {/* Protected Routes */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <ProjectEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ProjectEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collections"
                  element={
                    <ProtectedRoute>
                      <CollectionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileSettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <AccountSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
